import { useReducer, useCallback, useEffect } from 'react';
import type {
  AppState,
  AppStep,
  ParsedFileData,
  TimeSlotConfig,
  GroupConfig,
  GroupResults,
  CombinedResults,
} from '../types';
import { INITIAL_APP_STATE, INITIAL_COMBINED_RESULTS } from '../types';
import { parseExcelFile, countSessionsPerTimeSlot } from '../services/excelParser';
import { processGroup, accumulateResults, removeGroup } from '../services/paymentCalculator';
import { saveGroupConfig, getAllConfigs } from '../services/storageService';
import { validateConfiguration, validateAllTimeSlotsConfigured } from '../services/validator';

// Action types
type Action =
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'SET_GROUP_NAME'; payload: string }
  | { type: 'SET_PRICE'; payload: number | null }
  | { type: 'SET_PARSED_DATA'; payload: ParsedFileData }
  | { type: 'SET_TIME_SLOT_CONFIGS'; payload: TimeSlotConfig[] }
  | { type: 'SET_GROUP_RESULTS'; payload: GroupResults }
  | { type: 'SET_ACCUMULATED_RESULTS'; payload: CombinedResults }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_CONFIG'; payload: GroupConfig }
  | { type: 'LOAD_SAVED_CONFIGS'; payload: GroupConfig[] }
  | { type: 'RESET_FOR_NEW_GROUP' }
  | { type: 'RESET_ALL' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_GROUP_NAME':
      return { ...state, currentGroupName: action.payload };
    case 'SET_PRICE':
      return { ...state, currentPricePerHour: action.payload };
    case 'SET_PARSED_DATA':
      return { ...state, parsedData: action.payload };
    case 'SET_TIME_SLOT_CONFIGS':
      return { ...state, timeSlotConfigs: action.payload };
    case 'SET_GROUP_RESULTS':
      return { ...state, currentGroupResults: action.payload };
    case 'SET_ACCUMULATED_RESULTS':
      return { ...state, accumulatedResults: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOAD_CONFIG':
      return {
        ...state,
        currentGroupName: action.payload.groupName,
        currentPricePerHour: action.payload.pricePerHour,
        timeSlotConfigs: action.payload.timeSlots,
      };
    case 'LOAD_SAVED_CONFIGS':
      return { ...state, savedConfigs: action.payload };
    case 'RESET_FOR_NEW_GROUP':
      return {
        ...state,
        currentStep: 'upload',
        currentGroupName: '',
        currentPricePerHour: null,
        parsedData: null,
        timeSlotConfigs: [],
        currentGroupResults: null,
        error: null,
      };
    case 'RESET_ALL':
      return {
        ...INITIAL_APP_STATE,
        savedConfigs: state.savedConfigs,
      };
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_APP_STATE);

  // Load saved configs on mount
  useEffect(() => {
    const configs = getAllConfigs();
    dispatch({ type: 'LOAD_SAVED_CONFIGS', payload: configs });
  }, []);

  // Actions
  const setStep = useCallback((step: AppStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const setGroupName = useCallback((name: string) => {
    dispatch({ type: 'SET_GROUP_NAME', payload: name });
  }, []);

  const setPrice = useCallback((price: number | null) => {
    dispatch({ type: 'SET_PRICE', payload: price });
  }, []);

  const setTimeSlotConfigs = useCallback((configs: TimeSlotConfig[]) => {
    dispatch({ type: 'SET_TIME_SLOT_CONFIGS', payload: configs });
  }, []);

  const loadConfig = useCallback((config: GroupConfig) => {
    dispatch({ type: 'LOAD_CONFIG', payload: config });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // Parse uploaded file
  const handleFileUpload = useCallback(async (file: File) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const parsedData = await parseExcelFile(file);
      dispatch({ type: 'SET_PARSED_DATA', payload: parsedData });
      
      dispatch({ type: 'SET_STEP', payload: 'configure' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to parse Excel file',
      });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, []);

  // Calculate payments
  const calculatePayments = useCallback(() => {
    if (!state.parsedData || !state.currentPricePerHour) {
      dispatch({ type: 'SET_ERROR', payload: 'Missing required data' });
      return;
    }

    // Validate configuration
    const configValidation = validateConfiguration({
      groupName: state.currentGroupName,
      pricePerHour: state.currentPricePerHour,
      timeSlots: state.timeSlotConfigs,
    });

    if (!configValidation.valid) {
      dispatch({ type: 'SET_ERROR', payload: configValidation.error || 'Invalid configuration' });
      return;
    }

    // Validate all time slots are configured
    const slotsValidation = validateAllTimeSlotsConfigured(
      state.parsedData.timeSlots,
      state.timeSlotConfigs
    );

    if (!slotsValidation.valid) {
      dispatch({
        type: 'SET_ERROR',
        payload: `Missing duration for time slots: ${slotsValidation.missingSlots.join(', ')}`,
      });
      return;
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Process the group
      const results = processGroup(
        state.parsedData.sessions,
        state.timeSlotConfigs,
        state.currentGroupName,
        state.currentPricePerHour,
        state.parsedData.warnings
      );

      dispatch({ type: 'SET_GROUP_RESULTS', payload: results });

      // Accumulate results
      const newAccumulated = accumulateResults(state.accumulatedResults, results);
      dispatch({ type: 'SET_ACCUMULATED_RESULTS', payload: newAccumulated });

      // Save configuration for future use
      const configToSave: GroupConfig = {
        groupName: state.currentGroupName,
        pricePerHour: state.currentPricePerHour,
        timeSlots: state.timeSlotConfigs,
        lastUsed: new Date().toISOString(),
      };
      saveGroupConfig(configToSave);

      // Refresh saved configs
      const configs = getAllConfigs();
      dispatch({ type: 'LOAD_SAVED_CONFIGS', payload: configs });

      dispatch({ type: 'SET_STEP', payload: 'results' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to calculate payments',
      });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.parsedData, state.currentGroupName, state.currentPricePerHour, state.timeSlotConfigs, state.accumulatedResults]);

  // Reset for new group
  const resetForNewGroup = useCallback(() => {
    dispatch({ type: 'RESET_FOR_NEW_GROUP' });
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
    dispatch({ type: 'SET_ACCUMULATED_RESULTS', payload: INITIAL_COMBINED_RESULTS });
  }, []);

  // Delete a processed group
  const deleteGroup = useCallback((groupName: string) => {
    const newAccumulated = removeGroup(state.accumulatedResults, groupName);
    dispatch({ type: 'SET_ACCUMULATED_RESULTS', payload: newAccumulated });
    
    // If no groups left, go back to upload
    if (newAccumulated.groups.length === 0) {
      dispatch({ type: 'RESET_FOR_NEW_GROUP' });
    }
  }, [state.accumulatedResults]);

  // Update a processed group (edit functionality)
  const updateGroup = useCallback((
    groupName: string,
    newPricePerHour: number,
    newTimeSlotConfigs: TimeSlotConfig[]
  ) => {
    // Find the existing group
    const existingGroup = state.accumulatedResults.groups.find(
      (g) => g.groupName === groupName
    );

    if (!existingGroup) {
      console.error(`Group ${groupName} not found`);
      return;
    }

    // We need to recalculate based on the original sessions
    // Since we don't store sessions, we recalculate from trainerHours
    // This is a simplified recalculation - just updates the price
    
    // Recalculate payments with new price
    const updatedPayments = existingGroup.trainerHours
      .filter((th) => th.totalHours > 0)
      .map((th) => ({
        trainerName: th.trainerName,
        totalHours: th.totalHours,
        totalPayment: th.totalHours * newPricePerHour,
        groupName,
      }));

    const totalHours = updatedPayments.reduce((sum, p) => sum + p.totalHours, 0);
    const totalPayment = updatedPayments.reduce((sum, p) => sum + p.totalPayment, 0);

    const updatedGroup: GroupResults = {
      ...existingGroup,
      pricePerHour: newPricePerHour,
      trainerPayments: updatedPayments,
      totalHours,
      totalPayment,
      processedAt: new Date().toISOString(),
    };

    // Update accumulated results
    const newAccumulated = accumulateResults(
      removeGroup(state.accumulatedResults, groupName),
      updatedGroup
    );

    dispatch({ type: 'SET_ACCUMULATED_RESULTS', payload: newAccumulated });

    // Save updated configuration
    const configToSave: GroupConfig = {
      groupName,
      pricePerHour: newPricePerHour,
      timeSlots: newTimeSlotConfigs,
      lastUsed: new Date().toISOString(),
    };
    saveGroupConfig(configToSave);

    // Refresh saved configs
    const configs = getAllConfigs();
    dispatch({ type: 'LOAD_SAVED_CONFIGS', payload: configs });
  }, [state.accumulatedResults]);

  // View combined results
  const viewCombined = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: 'combined' });
  }, []);

  // Reload saved configurations
  const reloadConfigs = useCallback(() => {
    const configs = getAllConfigs();
    dispatch({ type: 'LOAD_SAVED_CONFIGS', payload: configs });
  }, []);

  // Get session counts for time slots
  const sessionCounts = state.parsedData
    ? countSessionsPerTimeSlot(state.parsedData.sessions)
    : {};

  return {
    state,
    sessionCounts,
    actions: {
      setStep,
      setGroupName,
      setPrice,
      setTimeSlotConfigs,
      loadConfig,
      setError,
      handleFileUpload,
      calculatePayments,
      resetForNewGroup,
      resetAll,
      deleteGroup,
      updateGroup,
      viewCombined,
      reloadConfigs,
    },
  };
}

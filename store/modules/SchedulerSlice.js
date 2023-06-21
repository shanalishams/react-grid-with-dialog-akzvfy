import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { reset } from '../mutators';
import { schedulerAPI } from '../../modules/workshop/api/scheduler';
import Utility from '../../common/utils/utility';
import { App } from '../../utilities/Constants';
import { toast } from 'react-toastify';

const initialState = {
  priorityCodes: {
    list: [],
    changed: false,
    loading: false,
    error: null,
  },
  filters: {
    invoiceTypes: [],
    isDepotOnJob: true,
    isDepotOnWorker: true,
  },
  search: {
    list: [],
    loading: false,
  },
};

export const SchedulerSlice = createSlice({
  name: 'scheduler',
  initialState,
  reducers: {
    SET_PRIORITY_CODES: (state, action) => {
      state.priorityCodes.list = action.payload.priorityCodes;
    },
    SET_PRIORITY_CODE_HEX_COLOR: (state, action) => {
      const priorityCode = state.priorityCodes.list.find((priorityCode) => {
        return (
          priorityCode.PriorityId === action.payload.priorityCode.PriorityId
        );
      });
      if (priorityCode) {
        priorityCode.HexColour = action.payload.hexColor;
      }
    },
    SET_PRIORITY_CODES_LOADING: (state, action) => {
      state.priorityCodes.loading = action.payload.loading;
    },
    SET_PRIORITY_CODES_ERROR: (state, action) => {
      state.priorityCodes.error = action.payload.error;
    },
    SET_PRIORITY_CODE_CHANGED: (state, action) => {
      state.priorityCodes.changed = action.payload;
    },
    SET_FILTERS: (state, action) => {
      state.filters = action.payload.filters;
    },
    SET_SEARCH_SCHEDULER_TASKS: (state, action) => {
      state.search.list = action.payload.schedulerTasks.map((task) => {
        return {
          ...task,
          EstStartDate:
            task.EstStartDate != null ? new Date(task.EstStartDate) : null,
          EstEndDate:
            task.EstEndDate != null ? new Date(task.EstEndDate) : null,
          RequiredDate:
            task.RequiredDate != null ? new Date(task.RequiredDate) : null,
          OrderDate: task.OrderDate != null ? new Date(task.OrderDate) : null,
        };
      });
    },
    SET_SEARCH_SCHEDULER_TASKS_LOADING: (state, action) => {
      state.search.loading = action.payload.loading;
    },

    // Reset state.
    SchedulerRESET: (state) => {
      reset(state, initialState);
    },
  },
});

/* Getters */
export const getPriorityCodes = (state) => {
  return state.RootReducer.SchedulerSlice.priorityCodes.list;
};

export const isAnyPriorityCodeChanged = (state) => {
  return state.RootReducer.SchedulerSlice.priorityCodes.changed;
};

export const getFilters = (state) => {
  return state.RootReducer.SchedulerSlice.filters;
};

export const isDefaultFiltersApplied = (state) => {
  return (
    state.RootReducer.SchedulerSlice.filters.invoiceTypes.includes(
      App.ALL_ID
    ) &&
    initialState.filters.isDepotOnJob ===
      state.RootReducer.SchedulerSlice.filters.isDepotOnJob &&
    initialState.filters.isDepotOnWorker ===
      state.RootReducer.SchedulerSlice.filters.isDepotOnWorker
  );
};

export const getSchedulerTasks = (state) => {
  return state.RootReducer.SchedulerSlice.search.list;
};

export const getSchedulerTasksParent = (state) => {
  return state.RootReducer.SchedulerSlice.search.list.filter((item, index) => {
    const nextItems = state.RootReducer.SchedulerSlice.search.list.slice(
      index + 1
    );
    return !nextItems.some((nextItem) => {
      return item.JobNumber === nextItem.JobNumber;
    });
  });
};

export const getSchedulerTasksLoading = (state) => {
  return state.RootReducer.SchedulerSlice.search.loading;
};

/* actions */
export const getAllPriorityCode = createAsyncThunk(
  'scheduler/getAllPriorityCode',
  async (_, { dispatch }) => {
    try {
      dispatch(SET_PRIORITY_CODES_LOADING({ loading: true }));

      const response = await schedulerAPI.getAllPriorityCode();
      const priorityCodes = response.data.data;
      dispatch(SET_PRIORITY_CODES({ priorityCodes }));
      dispatch(SET_PRIORITY_CODE_CHANGED(false));
    } catch (error) {
      const message = Utility._getErrorMessage(error);
      dispatch(SET_PRIORITY_CODES_ERROR({ error: message }));
      console.error(error);
    } finally {
      dispatch(SET_PRIORITY_CODES_LOADING({ loading: false }));
    }
  }
);

export const updatePriorityHexColour = createAsyncThunk(
  'scheduler/updatePriorityHexColour',
  async (args, { dispatch }) => {
    try {
      dispatch(SET_PRIORITY_CODES_LOADING({ loading: true }));

      await schedulerAPI.updatePriorityHexColour(args);

      dispatch(
        SET_PRIORITY_CODE_HEX_COLOR({
          priorityCode: args,
          hexColor: args.HexColour,
        })
      );
      dispatch(SET_PRIORITY_CODE_CHANGED(true));
    } catch (error) {
      const message = Utility._getErrorMessage(error);
      dispatch(SET_PRIORITY_CODES_ERROR({ error: message }));
      console.error(error);
    } finally {
      dispatch(SET_PRIORITY_CODES_LOADING({ loading: false }));
    }
  }
);

export const getSearchSchedulerTasks = createAsyncThunk(
  'scheduler/getSearchSchedulerTasks',
  async (args, { dispatch }) => {
    try {
      dispatch(SET_SEARCH_SCHEDULER_TASKS_LOADING({ loading: true }));
      dispatch(SET_SEARCH_SCHEDULER_TASKS({ schedulerTasks: [] }));

      const response = await schedulerAPI.getSearchSchedulerTasks(args);
      const schedulerTasks = response.data.data;
      dispatch(SET_SEARCH_SCHEDULER_TASKS({ schedulerTasks }));
    } catch (error) {
      const message = Utility._getErrorMessage(error);

      if (message?.includes('Timeout expired')) {
        toast.error(
          'Search timeout occurred. Please narrow down your search.',
          App.DEFUALT_TOAST_OPTIONS
        );
      } else if (message) {
        toast.error(
          'Search failed due to a system error. Please try again later.',
          App.DEFUALT_TOAST_OPTIONS
        );
      }
    } finally {
      dispatch(SET_SEARCH_SCHEDULER_TASKS_LOADING({ loading: false }));
    }
  }
);

export const {
  SET_PRIORITY_CODES,
  SET_PRIORITY_CODE_HEX_COLOR,
  SET_PRIORITY_CODES_LOADING,
  SET_PRIORITY_CODES_ERROR,
  SET_PRIORITY_CODE_CHANGED,
  SET_FILTERS,
  SET_SEARCH_SCHEDULER_TASKS,
  SET_SEARCH_SCHEDULER_TASKS_LOADING,
  SchedulerRESET,
} = SchedulerSlice.actions;

export default SchedulerSlice.reducer;

import React from 'react';
import './SearchModal.css';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import {
  getSchedulerTasks,
  getSchedulerTasksLoading,
  getSchedulerTasksParent,
  getSearchSchedulerTasks,
  SET_SEARCH_SCHEDULER_TASKS,
} from './store/modules/SchedulerSlice';
import {
  ChangeEventArgs,
  DropDownListComponent,
} from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';

import {
  Inject,
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  PageSettingsModel,
  Page,
  Sort,
  SortSettingsModel,
  DetailRow,
  GridModel,
  Filter,
  FilterSettingsModel,
} from '@syncfusion/ej2-react-grids';
import {
  DateRange,
  DateRangePickerComponent,
} from '@syncfusion/ej2-react-calendars';
import moment from 'moment';
import { toast } from 'react-toastify';
import { DialogComponent } from '@syncfusion/ej2-react-popups';

const SearchModal = React.forwardRef(function SearchModel(props, ref) {
  const dispatcher = useAppDispatch();
  const schedulerTasksParent = useAppSelector(getSchedulerTasksParent);
  const schedulerTasksChild = useAppSelector(getSchedulerTasks);
  const schedulerTasksLoading = useAppSelector(getSchedulerTasksLoading);

  const searchDialog = React.useRef();
  const searchInputRef = React.useRef();
  const fromToDateRangeRef = React.useRef();
  const durationRef = React.useRef();
  const searchCriteriaRef = React.useRef();
  const searchResultGridRef = React.useRef();

  const [searchInput, setSearchInput] = React.useState < string > '';
  const [searchCriteria, setSearchCriteria] =
    React.useState < string > 'customerName';

  const ADVANCE_OPTION = 7;

  const durationData = [
    { id: 1, text: '1 Month' },
    { id: 2, text: '2 Months' },
    { id: 3, text: '3 Months' },
    { id: 6, text: '6 Months' },
    { id: ADVANCE_OPTION, text: 'Advanced Option' },
  ];

  const [maxDuration] = React.useState < number > 180;
  const [currentDuration, setCurrentDuration] = React.useState < number > 1;
  const [fromToDateRange, setFromToDateRange] = React.useState();
  const [startDate, setStartDate] = React.useState < Date > moment().toDate();
  const [endDate, setEndDate] =
    React.useState < Date > moment().add(1, 'months').toDate();

  const mainCriteria = [
    { id: 'customerName', text: 'Customer Name/Contact' },
    { id: 'wholegoodModelDesc', text: 'Wholegood Model and Description' },
    { id: 'jobDescription', text: 'Job Description' },
    { id: 'contactNumber', text: 'Contact Number' },
  ];

  React.useEffect(() => {
    const input = document.getElementById('searchModalSearchInput');
    const onKeyPressHandler = function (keyboardInput) {
      if (keyboardInput.code === 'Enter' || keyboardInput === 'NumpadEnter') {
        void searchSchedulerTasks(keyboardInput.target?.value);
      }
    };
    input?.addEventListener('keypress', onKeyPressHandler);

    return () => {
      input?.removeEventListener('keypress', onKeyPressHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInputRef.current]);

  const onDurationChange = (event) => {
    const value = +event.value;
    if (value !== ADVANCE_OPTION) {
      const lStartDate = moment();
      setStartDate(lStartDate.toDate());

      const lEndDate = lStartDate.add(value, 'months').toDate();
      setEndDate(lEndDate);
    }
    setCurrentDuration(value);
  };

  const searchSchedulerTasks = async (searchTerm) => {
    let queryString;
    if (searchTerm.length < 3) {
      toast.info('Search should be at least 3 characters.', {
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
        hideProgressBar: false,
        pauseOnHover: true,
        position: 'bottom-right',
        progress: undefined,
        theme: 'light',
      });
      return;
    } else if (searchTerm.length > 300) {
      toast.info('Search should be less then 300 characters.', {
        autoClose: 5000,
        closeOnClick: true,
        draggable: true,
        hideProgressBar: false,
        pauseOnHover: true,
        position: 'bottom-right',
        progress: undefined,
        theme: 'light',
      });
      return;
    }

    searchTerm = encodeURIComponent(searchTerm);

    if (durationRef.current && durationRef.current.value !== ADVANCE_OPTION) {
      queryString = `${
        searchCriteriaRef.current?.value
      }=${searchTerm}&startDate=${startDate.toDateString()}&endDate=${endDate.toDateString()}`;
    } else {
      const lStarDate = fromToDateRangeRef.current?.startDate.toDateString();
      const lEndDate = fromToDateRangeRef.current?.endDate.toDateString();
      queryString = `${searchCriteriaRef.current?.value}=${searchTerm}&startDate=${lStarDate}&endDate=${lEndDate}`;
    }
    await dispatcher(getSearchSchedulerTasks(queryString));
  };

  React.useImperativeHandle(
    ref,
    () => {
      return {
        show(fullScreen) {
          searchDialog.current?.show(fullScreen);
        },
      };
    },
    []
  );

  const dialogButtons = [
    {
      buttonModel: {
        id: 'schedulerModalReset',
        content: 'Search',
        cssClass: 'e-flat',
        isPrimary: true,
      },
      click: async () => {
        await searchSchedulerTasks(searchInputRef.current?.value ?? '');
      },
    },
    {
      buttonModel: {
        id: 'schedulerModalReset',
        content: 'Reset',
        cssClass: 'e-flat',
        isPrimary: false,
      },
      click: () => {
        onReset();
      },
    },
    {
      buttonModel: {
        id: 'schedulerModalClose',
        content: 'Close',
        cssClass: 'e-flat',
      },
      click: () => {
        searchDialog.current?.hide();
      },
    },
  ];

  const onReset = () => {
    setSearchInput('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    setSearchCriteria('customerName');
    if (durationRef.current) {
      durationRef.current.value = 1;
    }
    setFromToDateRange({});
    searchResultGridRef.current?.clearFiltering();
    searchResultGridRef.current?.clearSorting();

    dispatcher(SET_SEARCH_SCHEDULER_TASKS({ schedulerTasks: [] }));

    setTimeout(() => {
      searchResultGridRef.current?.sortColumn('JobNumber', 'Ascending');
    });
  };

  /* Start: Syncfusion Grid Settings & Functions */

  const pageSettings = { pageSize: 10 };

  const sortingSettings = {
    columns: [{ field: 'JobNumber', direction: 'Ascending' }],
  };

  const childGridOptions = {
    clipMode: 'EllipsisWithTooltip',
    columns: [
      { field: 'TaskStatusStr', headerText: 'Schedule Status', width: 150 },
      { field: 'EngineerName', headerText: 'Engineer Name', width: 150 },
      {
        field: 'EstStartDate',
        headerText: 'Scheduled Date From',
        width: 150,
        type: 'Date',
        format: 'dd/MM/yyyy HH:mm',
      },
      {
        field: 'EstEndDate',
        headerText: 'Scheduled Date To',
        width: 150,
        type: 'Date',
        format: 'dd/MM/yyyy HH:mm',
      },
    ],
    dataSource: schedulerTasksChild,
    queryString: 'JobNumber',
  };

  const filterOptions = {
    ignoreAccent: true,
    showFilterBarOperator: true,
    type: 'Menu',
  };

  /* END: Syncfusion Grid Functions */

  return (
    <>
      <DialogComponent
        className={'search-modal'}
        id={'searchModalMainWindow'}
        ref={(dialog) => {
          searchDialog.current = dialog;
        }}
        showCloseIcon={true}
        closeOnEscape={true}
        visible={true}
        header="Search Active and Un-Scheduled Jobs"
        buttons={dialogButtons}
      >
        <div className="form-row" style={{ marginBottom: '0.5%' }}>
          <div className="col-5">
            <TextBoxComponent
              ref={(textBox) => {
                searchInputRef.current = textBox;
              }}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.value);
              }}
              id={'searchModalSearchInput'}
              type={'text'}
              placeholder="Search"
              floatLabelType="Auto"
              showClearButton={true}
            />
          </div>
          <div className="col-3">
            <DropDownListComponent
              ref={(dropdown) => {
                searchCriteriaRef.current = dropdown;
              }}
              id="searchModalCriteria"
              dataSource={mainCriteria}
              fields={{ value: 'id', text: 'text' }}
              placeholder="Select a Criteria"
              floatLabelType="Auto"
              value={searchCriteria}
              change={(event) => {
                setSearchCriteria(event.value);
              }}
            />
          </div>
          <div className="col-2">
            <DropDownListComponent
              ref={(dropdown) => {
                durationRef.current = dropdown;
              }}
              id="searchModalDuration"
              dataSource={durationData}
              fields={{ value: 'id', text: 'text' }}
              placeholder="Select a Duration"
              floatLabelType="Auto"
              change={onDurationChange}
              close={() => {
                if (currentDuration === ADVANCE_OPTION) {
                  fromToDateRangeRef.current?.focusIn();
                }
              }}
              value={currentDuration}
            />
          </div>
          <div className="col-2">
            {currentDuration === ADVANCE_OPTION && (
              <DateRangePickerComponent
                ref={(dateRangePicker) => {
                  fromToDateRangeRef.current = dateRangePicker;
                }}
                id="searchModalFromToDateRange"
                placeholder="Select a Date Range (6 Months Max)"
                floatLabelType="Auto"
                strictMode={true}
                minDays={1}
                maxDays={maxDuration}
                value={fromToDateRange}
                onChange={(event) => {
                  setFromToDateRange(event.value);
                }}
                format={'dd/MM/yyyy'}
                created={() => {
                  fromToDateRangeRef.current?.focusIn();
                }}
              />
            )}
          </div>
        </div>
        {schedulerTasksLoading ? (
          <div
            className="form-row"
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <div
              className="spinner-border"
              style={{ color: '#e3165b' }}
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="form-row">
            <GridComponent
              id={'searchResultGridRef'}
              ref={(grid) => {
                searchResultGridRef.current = grid;
              }}
              dataSource={schedulerTasksParent}
              pageSettings={pageSettings}
              allowPaging={true}
              sortSettings={sortingSettings}
              allowSorting={true}
              filterSettings={filterOptions}
              allowFiltering={true}
              childGrid={childGridOptions}
              clipMode={'EllipsisWithTooltip'}
            >
              <ColumnsDirective>
                <ColumnDirective
                  field="JobStatus"
                  headerText="Job Status"
                  width={140}
                  filter={{ type: 'CheckBox' }}
                />
                <ColumnDirective
                  field="JobNumber"
                  headerText="Job Number"
                  template={`<a id="searchModalJobNumber-\${JobNumber}" href="${process.env.REACT_APP_WEB_PORTAL_URL}/#/workshop/job/\${JobNumber}/edit" target="_blank" rel="noreferrer">\${JobNumber}</a>`}
                  width={150}
                  type={'string'}
                />
                <ColumnDirective
                  field="JobDescription1"
                  headerText="Job Desc 1"
                  width={150}
                  type={'string'}
                />
                <ColumnDirective
                  field="JobDescription2"
                  headerText="Job Desc 2"
                  width={150}
                  type={'string'}
                />
                <ColumnDirective
                  field="OrderDate"
                  headerText="Job Creation"
                  width={150}
                  type={'Date'}
                  format={'dd/MM/yyyy HH:mm'}
                />
                <ColumnDirective
                  field="CustomerName"
                  headerText="Customer Name"
                  width={170}
                  type={'string'}
                />
                <ColumnDirective
                  field="ContactNumber"
                  headerText="Contact Number"
                  width={170}
                  type={'string'}
                />
                <ColumnDirective
                  field="WholegoodModel"
                  headerText="Wholegood Model"
                  width={180}
                  type={'string'}
                />
                <ColumnDirective
                  field="WholegoodDescription"
                  headerText="Wholegood Desc"
                  width={170}
                  type={'string'}
                />
                <ColumnDirective
                  field="PartsAvailability"
                  headerText="Parts Availability"
                  width={170}
                  filter={{ type: 'CheckBox' }}
                  type={'string'}
                />
                <ColumnDirective
                  field="RequiredDate"
                  headerText="Required By"
                  width={170}
                  type={'Date'}
                  format={'dd/MM/yyyy HH:mm'}
                />
                <ColumnDirective
                  field="ContactName"
                  headerText="Contact Name"
                  width={170}
                  type={'string'}
                />
                <ColumnDirective
                  field="DaysOpen"
                  headerText="Days Open"
                  width={170}
                  type={'number'}
                  filter={{ params: { format: '#' } }}
                />
              </ColumnsDirective>
              <Inject services={[Sort, Page, DetailRow, Filter]}></Inject>
            </GridComponent>
          </div>
        )}
      </DialogComponent>
    </>
  );
});
export default SearchModal;

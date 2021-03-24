/* eslint-disable react/no-unused-state */
import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  Appointments,
  AppointmentTooltip,
  AppointmentForm,
  WeekView,
  DateNavigator,
  TodayButton,
  Toolbar,
  DragDropProvider,
} from '@devexpress/dx-react-scheduler-material-ui';

import { demoConcrete } from './demo-data/ConcreteTasks';
//import { demoFluid } from './demo-data/FluidTasks.json';
const appointments = demoConcrete;

const messages = {
  moreInformationLabel: '',
};

const TextEditor = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.type === 'multilineTextEditor') {
    return null;
  } return <AppointmentForm.TextEditor {...props} />;
};

const concreteTasks = ({ onFieldChange, appointmentData, ...restProps }) => {
  return (
    <AppointmentForm.BasicLayout
      appointmentData={appointmentData}
      onFieldChange={onFieldChange}
      {...restProps}
    >
    </AppointmentForm.BasicLayout>
  );
};

export default class Demo extends React.PureComponent {
  
  constructor(props) {
    super(props);
    this.state = {
      fields: {},
      taskList: [],
      title: "",
      durationHour: "",
      durationMin: "",
      testList: [],
      testList2: [],
      data: appointments,
      currentDate: '2021-03-12',
    };

    this.currentDateChange = (currentDate) => { this.setState({ currentDate }); };

    this.commitChanges = this.commitChanges.bind(this);
  }

  commitChanges({ added, changed, deleted }) {
    this.setState((state) => {
      let { data } = state;
      if (added) {
        const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
        data = [...data, { id: startingAddedId, ...added }];
      }
      if (changed) {
        data = data.map(appointment => (
          changed[appointment.id] ? { ...appointment, ...changed[appointment.id] }
            : appointment));
      }
      if (deleted !== undefined) {
        data = data.filter(appointment => appointment.id !== deleted);
      }
      return { data };
    });
  }

  updateInput(key, value){
    this.setState({
        [key]: value
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
      const newItem={
          id: 1 + Math.random(),
          title: this.state.title.slice(),
          durationHour: this.state.durationHour.slice(),
          durationMin: this.state.durationMin.slice()
      };

      const taskList = [...this.state.taskList];

      taskList.push(newItem);

      this.setState({
          taskList,
          title: "",
          durationHour: "",
          durationMin: "",
      });
  };

  deleteItem(id){
      const taskList = [...this.state.taskList];
      const updatedList = taskList.filter(item => item.id !== id);
      this.setState({taskList: updatedList});
  }

  sendToCalendar(){
    const clearTaskList = []
    let data = [...this.state.data];
    const takenTime = this.state.data.map(function(item) {
      return {
        startDate: item.startDate,
        endDate: item.endDate,
      };
    });

    let sortedTimeTaken = takenTime.sort((a, b) => a.startDate - b.startDate)
    let availableTimeSlots = []

    for (let i = 0; i < sortedTimeTaken.length - 1; i++){
      availableTimeSlots.push({
        startDate: sortedTimeTaken[i].endDate,
        endDate: sortedTimeTaken[i + 1].startDate,
        availableTime: sortedTimeTaken[i + 1].startDate - sortedTimeTaken[i].endDate
      });
    }

    const tasks = this.state.taskList.map(function(item) {
      return {
        title: item.title,
        time: ((item.durationHour * 3600) + (item.durationMin * 60)) * 1000,
      };
    });

    let sortedAvailableTimeSlots = availableTimeSlots.sort((a, b) => a.availableTime - b.availableTime)
    let sortedTasks = tasks.sort((a, b) => b.time - a.time)    
    let x = 0

    while (x < sortedTasks.length){
      let n = 0;
      while(n < sortedAvailableTimeSlots.length && sortedAvailableTimeSlots[n].availableTime < sortedTasks[x].time){
        n++;
      }

      if (n < sortedAvailableTimeSlots.length){
        let newItem={
          title: "Fluid Task: " + sortedTasks[x].title,
          startDate: sortedAvailableTimeSlots[n].startDate,
          endDate: new Date(sortedAvailableTimeSlots[n].startDate.getTime() + sortedTasks[x].time),
          id: 1 + Math.random(),
        };
        
        data.push(newItem);
        

        sortedAvailableTimeSlots[n].startDate = new Date(sortedAvailableTimeSlots[n].startDate.getTime() + sortedTasks[x].time);
        sortedAvailableTimeSlots[n].availableTime = sortedAvailableTimeSlots[n].endDate - sortedAvailableTimeSlots[n].startDate;
        sortedAvailableTimeSlots = sortedAvailableTimeSlots.sort((a, b) => a.availableTime - b.availableTime)
      } else {

        let hours = Math.round(sortedTasks[x].time / 7200000);
        let minutes = (sortedTasks[x].time - (7200000 * hours)) / 60000;
        let roundedMinutes = (Math.round(minutes / 15) * 15) % 60;

        let newItem={
          title: sortedTasks[x].title,
          time: (hours * 3600000) + (roundedMinutes * 60000)
        };
        sortedTasks.push(newItem);
        sortedTasks.push(newItem);

      }

      x++;
    }

    this.setState({data});
    this.setState({taskList: clearTaskList});
  }


  render() {
    const { currentDate, data } = this.state;

    //appointments.forEach(element => console.log(element));

    return (
      <Paper>
        <Scheduler
          data={data}
          height={900}
        >
          <ViewState
            currentDate={currentDate}
            onCurrentDateChange={this.currentDateChange}
          />
          <EditingState
            onCommitChanges={this.commitChanges}
          />
          <IntegratedEditing />

          <WeekView
            startDayHour={0}
            endDayHour={24}
          />
          <Toolbar />
          <DateNavigator />
          <TodayButton />
          <Appointments />
          <AppointmentTooltip
            showOpenButton
            showDeleteButton
          />
          <AppointmentForm
            basicLayoutComponent={concreteTasks}
            textEditorComponent={TextEditor}
            messages={messages}
          />
          <DragDropProvider />
        </Scheduler>

        <div>
          <h1>Fluid Tasks</h1>



          <div>
                <form>
                    <input placeholder='Title' value ={this.state.title} 
                        onChange={e => this.updateInput("title", e.target.value)} />
                    <br />
                    <input placeholder='Duration(hours)' value ={this.state.durationHour} 
                        onChange={e => this.updateInput("durationHour", e.target.value)} /> 
                    <br />
                    <input placeholder='Duration(minutes)' value ={this.state.durationMin} 
                        onChange={e => this.updateInput("durationMin", e.target.value)} /> 
                    <br />
                <button onClick={e => this.onSubmit(e)}>Submit</button>
                </form>
            <ul>
                {this.state.taskList.map(item => {
                    return(
                        <li key={item.id}>
                            Title: {item.title}, Duration(Hour): {item.durationHour}, Duration(Minutes): {item.durationMin}
                            <button
                                onClick={() => this.deleteItem(item.id)}
                            >X</button>
                        </li>
                    )
                })}
            </ul>
            </div>







          <p>{JSON.stringify(this.state.fields, null, 2)}</p>
          <br/>

          
          
          <p></p>
          <button onClick={e => this.sendToCalendar()}>Send To Calendar</button>


        </div>
      </Paper>
    );
  }
}

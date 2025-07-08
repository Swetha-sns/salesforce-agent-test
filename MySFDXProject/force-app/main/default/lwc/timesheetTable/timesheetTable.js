import { LightningElement, track, wire } from 'lwc';
import getProjects from '@salesforce/apex/ProjectController.getProjects';
import saveTimeLogs from '@salesforce/apex/TimeLogsController.saveTimeLogs';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TimeLogsTable extends LightningElement {
    @track projectOptions = [];
    @track timeLogEntries = [{ id: 1, projectId: '', weekData: this.initWeekData() }];

    // Fetch available projects
    @wire(getProjects)
    wiredProjects({ error, data }) {
        if (data) {
            this.projectOptions = data.map(proj => ({ label: proj.Name, value: proj.Id }));
        }
    }

    // Initialize week data
    initWeekData() {
        return [
            { day: 'Monday', description: '' },
            { day: 'Tuesday', description: '' },
            { day: 'Wednesday', description: '' },
            { day: 'Thursday', description: '' },
            { day: 'Friday', description: '' },
            { day: 'Saturday', description: '' },
            { day: 'Sunday', description: '' }
        ];
    }

    // Handle project dropdown change
    handleProjectChange(event) {
        const index = event.target.dataset.index;
        this.timeLogEntries[index].projectId = event.target.value;
    }

    // Handle input changes for each day
    handleDescriptionChange(event) {
        const { index, day } = event.target.dataset;
        this.timeLogEntries[index].weekData.find(d => d.day === day).description = event.target.value;
    }

    // Add new project entry
    addProject() {
        const newEntry = { id: this.timeLogEntries.length + 1, projectId: '', weekData: this.initWeekData() };
        this.timeLogEntries = [...this.timeLogEntries, newEntry];
    }

    // Remove project entry
    removeProject(event) {
        const index = event.currentTarget.dataset.index;
        if (this.timeLogEntries.length > 1) {
            this.timeLogEntries.splice(index, 1);
            this.timeLogEntries = [...this.timeLogEntries];
        }
    }

    // Submit data to Apex
    handleSubmit() {
        // Prepare data for Apex
        const timeLogData = this.timeLogEntries.map(entry => ({
            projectId: entry.projectId,
            weekData: entry.weekData
        }));

        saveTimeLogs({ timeLogEntries: JSON.stringify(timeLogData) })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Time Logs saved successfully!',
                    variant: 'success'
                }));
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }
}

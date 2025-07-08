import { LightningElement, track, wire } from 'lwc';
import getProjects from '@salesforce/apex/SheetController.getProjects';
import saveSheet from '@salesforce/apex/SheetController.saveSheet';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SheetTable extends LightningElement {
    @track sheetName = '';
    @track description = '';
    @track projectOptions = [];
    @track sheetEntries = [];

    // Fetch Projects from Salesforce
    @wire(getProjects)
    wiredProjects({ error, data }) {
        if (data) {
            this.projectOptions = data.map(project => ({
                label: project.Name,
                value: project.Id
            }));
        } else if (error) {
            console.error('Error fetching projects', error);
        }
    }

    // Handle input changes (Sheet Name, Description)
    handleChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    // Handle Project Selection
    handleProjectChange(event) {
        const index = event.target.dataset.index;
        this.sheetEntries[index].projectId = event.target.value;
    }

    // Handle Work Description Changes (Monday-Sunday)
    handleDescriptionChange(event) {
        const index = event.target.dataset.index;
        const day = event.target.dataset.day;
        this.sheetEntries[index].weekData[day] = event.target.value;
    }

    // Add a New Project Row
    addProject() {
        this.sheetEntries.push({
            id: Date.now(),
            projectId: '',
            weekData: {
                Monday: '',
                Tuesday: '',
                Wednesday: '',
                Thursday: '',
                Friday: '',
                Saturday: '',
                Sunday: ''
            }
        });
    }

    // Remove a Project Row
    removeProject(event) {
        const index = event.target.dataset.index;
        this.sheetEntries.splice(index, 1);
    }

    // Submit Data to Apex
    handleSubmit() {
        if (!this.sheetName) {
            this.showToast('Error', 'Sheet Name is required', 'error');
            return;
        }

        const sheetData = JSON.stringify({
            sheetName: this.sheetName,
            description: this.description,
            entries: this.sheetEntries
        });

        saveSheet({ sheetData })
            .then(() => {
                this.showToast('Success', 'Sheet saved successfully', 'success');
                this.resetForm();
            })
            .catch(error => {
                console.error('Error saving sheet', error);
                this.showToast('Error', 'Failed to save sheet', 'error');
            });
    }

    // Reset Form
    resetForm() {
        this.sheetName = '';
        this.description = '';
        this.sheetEntries = [];
    }

    // Show Toast Message
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}

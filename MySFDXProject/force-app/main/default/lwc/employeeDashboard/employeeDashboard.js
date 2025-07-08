import { LightningElement, api, wire } from 'lwc';
import getEmployeeDetails from '@salesforce/apex/EmployeeController.getEmployeeDetails';

export default class EmployeeDashboard extends LightningElement {
    @api recordId; // Get the current employee's record ID
    employee;

    @wire(getEmployeeDetails, { employeeId: '$recordId' })
    wiredEmployee({ error, data }) {
        if (data) {
            this.employee = data;
        } else if (error) {
            console.error('Error fetching employee data:', error);
        }
    }

    // Compute CSS class dynamically based on Availability Status
    get availabilityClass() {
        if (!this.employee) return '';
        const status = this.employee.Availability_Status__c;
        return status === 'Fully Booked' ? 'fully-booked' :
               status === 'Non-Payable Hours' ? 'non-payable' :
               'available';
    }
}

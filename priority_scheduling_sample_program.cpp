#include <iostream>
#include <iomanip>
#include <algorithm>
using namespace std;

struct priority_scheduling {
    char process_name;
    int burst_time;
    int waiting_time;
    int turn_around_time;
    int priority;
};

bool compareProcesses(priority_scheduling p1, priority_scheduling p2) {
    if (p1.priority != p2.priority) {
        return p1.priority > p2.priority; // Higher priority first
    } else {
        return p1.burst_time < p2.burst_time; // Shortest job first
    }
}

void calculateWaitingTime(priority_scheduling process[], int n) {
    process[0].waiting_time = 0;

    for (int i = 1; i < n; i++) {
        process[i].waiting_time = 0;
        for (int j = 0; j < i; j++) {
            process[i].waiting_time += process[j].burst_time;
        }
    }
}

void calculateTurnaroundTime(priority_scheduling process[], int n) {
    for (int i = 0; i < n; i++) {
        process[i].turn_around_time = process[i].burst_time + process[i].waiting_time;
    }
}

void displayResults(priority_scheduling process[], int n) {
    float total_waiting_time = 0;
    float total_turnaround_time = 0;

    cout << "\nProcess\tBurst Time\tPriority\tWaiting Time\tTurnaround Time\n";
    cout << "-------------------------------------------------------------\n";

    for (int i = 0; i < n; i++) {
        cout << process[i].process_name << "\t" << process[i].burst_time << "\t\t" << process[i].priority << "\t\t"
             << process[i].waiting_time << "\t\t" << process[i].turn_around_time << endl;

        total_waiting_time += process[i].waiting_time;
        total_turnaround_time += process[i].turn_around_time;
    }

    float average_waiting_time = total_waiting_time / n;
    float average_turnaround_time = total_turnaround_time / n;

    cout << fixed << setprecision(2);
    cout << "\nAverage Waiting Time: " << average_waiting_time << endl;
    cout << "Average Turnaround Time: " << average_turnaround_time << endl;
}

int main() {
    int number_of_processes;

    cout << "Enter the total number of Processes: ";
    cin >> number_of_processes;

    priority_scheduling process[number_of_processes];

    char process_name = 'A';

    cout << "\nPlease Enter the Burst Time and Priority of each process:\n";

    for (int i = 0; i < number_of_processes; i++) {
        process[i].process_name = process_name++;
        cout << "\nEnter the details of process " << process[i].process_name << endl;
        cout << "Enter the burst time: ";
        cin >> process[i].burst_time;
        cout << "Enter the priority: ";
        cin >> process[i].priority;
    }

    sort(process, process + number_of_processes, compareProcesses);

    calculateWaitingTime(process, number_of_processes);
    calculateTurnaroundTime(process, number_of_processes);

    displayResults(process, number_of_processes);
    
    return 0;
}

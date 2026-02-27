import React, { useState } from 'react';
import { Download, FileSpreadsheet, Loader } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';

const ExportData = () => {
    const [generating, setGenerating] = useState(false);
    const [downloadReady, setDownloadReady] = useState(false);
    const [exportData, setExportData] = useState(null);
    const [stats, setStats] = useState(null);

    const generateReport = async () => {
        try {
            setGenerating(true);
            setDownloadReady(false);

            // Fetch all data
            const [candidatesRes, callsRes, statsRes] = await Promise.all([
                api.get('/api/candidates'),
                api.get('/api/calls'),
                api.get('/api/candidates/stats')
            ]);

            const candidates = candidatesRes.data.data;
            const calls = callsRes.data.data;
            const statistics = statsRes.data.data;

            // Prepare summary data
            const summary = {
                'Total Candidates': statistics.totalCandidates,
                'Total Calls': statistics.totalCalls,
                'Completed Calls': calls.filter(c => c.status === 'completed').length,
                'Missed Calls': calls.filter(c => c.status === 'missed').length,
                'Failed Calls': calls.filter(c => c.status === 'failed').length,
                'Active Calls': statistics.activeCalls,
                'Screenings Completed': statistics.screeningsCompleted,
                'Interviews Scheduled': statistics.interviewsScheduled,
                'Avg Communication Score': statistics.avgCommunicationScore,
                'Avg Technical Score': statistics.avgTechnicalScore,
                'Avg Overall Score': statistics.avgOverallScore
            };

            // Prepare candidates data
            const candidatesData = candidates.map(c => ({
                'Candidate Name': c.candidateName || 'N/A',
                'Phone Number': c.phoneNumber,
                'Email': c.email || 'N/A',
                'Current Company': c.currentCompany || 'N/A',
                'Current Role': c.currentRole || 'N/A',
                'Desired Role': c.desiredRole || 'N/A',
                'Domain': c.domain || 'N/A',
                'Experience (Years)': c.experienceYears || 'N/A',
                'Current Location': c.currentLocation || 'N/A',
                'Relocation Willing': c.relocationWilling || 'N/A',
                'Notice Period': c.noticePeriod || 'N/A',
                'Current CTC (LPA)': c.currentCtcLpa || 'N/A',
                'Expected CTC (LPA)': c.expectedCtcLpa || 'N/A',
                'Communication Score': c.communicationScore || 'N/A',
                'Technical Score': c.technicalScore || 'N/A',
                'Overall Score': c.overallScore || 'N/A',
                'Interested': c.interested || 'N/A',
                'Call Status': c.callStatus || 'N/A',
                'Disconnection Reason': c.disconnectionReason || 'N/A',
                'Next Round Availability': c.nextRoundAvailability || 'N/A',
                'Status': c.status,
                'Created At': new Date(c.createdAt).toLocaleString()
            }));

            // Prepare calls data
            const callsData = calls.map(c => ({
                'Call SID': c.callSid,
                'Phone Number': c.phoneNumber,
                'Candidate Name': c.candidateId?.candidateName || 'N/A',
                'Call Type': c.callType,
                'Status': c.status,
                'Duration (seconds)': c.duration || 0,
                'Transfer Requested': c.transferRequested ? 'Yes' : 'No',
                'Transfer Number': c.transferNumber || 'N/A',
                'Start Time': new Date(c.startTime).toLocaleString(),
                'End Time': c.endTime ? new Date(c.endTime).toLocaleString() : 'N/A'
            }));

            // Prepare missed calls data
            const missedCalls = calls.filter(c => c.status === 'missed').map(c => ({
                'Phone Number': c.phoneNumber,
                'Candidate Name': c.candidateId?.candidateName || 'Unknown',
                'Call Time': new Date(c.startTime).toLocaleString(),
                'Reason': 'Missed/No Answer'
            }));

            setExportData({
                summary: [summary],
                candidates: candidatesData,
                calls: callsData,
                missedCalls: missedCalls
            });

            setStats(statistics);
            setDownloadReady(true);
        } catch (error) {
            alert('Error generating report: ' + error.message);
        } finally {
            setGenerating(false);
        }
    };

    const downloadExcel = () => {
        if (!exportData) return;

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Add Summary sheet
        const summaryWs = XLSX.utils.json_to_sheet(exportData.summary);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        // Add Candidates sheet
        const candidatesWs = XLSX.utils.json_to_sheet(exportData.candidates);
        XLSX.utils.book_append_sheet(wb, candidatesWs, 'Candidates');

        // Add Calls sheet
        const callsWs = XLSX.utils.json_to_sheet(exportData.calls);
        XLSX.utils.book_append_sheet(wb, callsWs, 'All Calls');

        // Add Missed Calls sheet
        const missedWs = XLSX.utils.json_to_sheet(exportData.missedCalls);
        XLSX.utils.book_append_sheet(wb, missedWs, 'Missed Calls');

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `AIRA_Report_${timestamp}.xlsx`;

        // Download
        XLSX.writeFile(wb, filename);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Export Data</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Generate and download comprehensive reports
                </p>
            </div>

            {/* Generate Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <div className="text-center">
                    <FileSpreadsheet className="mx-auto h-16 w-16 text-primary-600 dark:text-primary-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Generate Excel Report
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Create a comprehensive Excel report with all candidates, calls, and statistics
                    </p>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={generateReport}
                            disabled={generating}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {generating ? (
                                <>
                                    <Loader className="animate-spin h-5 w-5 mr-2" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="h-5 w-5 mr-2" />
                                    Create Exportable Data
                                </>
                            )}
                        </button>

                        {downloadReady && (
                            <button
                                onClick={downloadExcel}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Download Excel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Preview */}
            {stats && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Report Preview
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Candidates</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCandidates}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Calls</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCalls}</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Screenings</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.screeningsCompleted}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Interviews</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.interviewsScheduled}</p>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Report includes:</p>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <li>✓ Summary statistics</li>
                            <li>✓ Complete candidate details ({exportData?.candidates.length || 0} records)</li>
                            <li>✓ All call records ({exportData?.calls.length || 0} records)</li>
                            <li>✓ Missed calls list ({exportData?.missedCalls.length || 0} records)</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportData;

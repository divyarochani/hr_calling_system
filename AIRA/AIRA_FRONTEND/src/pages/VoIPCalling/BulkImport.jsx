import React, { useState } from 'react';
import { Upload, Play, Pause, X, CheckCircle, XCircle, Phone, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';

const BulkImport = () => {
    const [file, setFile] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [calling, setCalling] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [callResults, setCallResults] = useState({});
    const [paused, setPaused] = useState(false);

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);

                // Extract phone numbers (support multiple column names)
                const phoneNumbers = data.map((row, index) => ({
                    id: index,
                    phoneNumber: row.phone || row.Phone || row.phoneNumber || row.PhoneNumber || row.mobile || row.Mobile || row.number || row.Number,
                    name: row.name || row.Name || row.candidateName || row.CandidateName || 'Unknown',
                    status: 'pending'
                })).filter(c => c.phoneNumber);

                setCandidates(phoneNumbers);
                setFile(uploadedFile);
                alert(`Loaded ${phoneNumbers.length} phone numbers`);
            } catch (error) {
                alert('Error reading file. Please ensure it\'s a valid Excel file.');
            }
        };
        reader.readAsBinaryString(uploadedFile);
    };

    const makeCall = async (candidate) => {
        try {
            const response = await api.post('/api/calls/outbound', null, {
                params: { phone_number: candidate.phoneNumber }
            });

            if (response.data.success) {
                setCallResults(prev => ({
                    ...prev,
                    [candidate.id]: { status: 'success', message: 'Call initiated' }
                }));
                return true;
            } else {
                setCallResults(prev => ({
                    ...prev,
                    [candidate.id]: { status: 'failed', message: 'Call failed' }
                }));
                return false;
            }
        } catch (error) {
            setCallResults(prev => ({
                ...prev,
                [candidate.id]: { status: 'failed', message: error.message }
            }));
            return false;
        }
    };

    const startCalling = async () => {
        setCalling(true);
        setPaused(false);

        for (let i = currentIndex; i < candidates.length; i++) {
            if (paused) {
                setCurrentIndex(i);
                break;
            }

            const candidate = candidates[i];
            setCurrentIndex(i);

            // Update status to calling
            setCandidates(prev => prev.map((c, idx) => 
                idx === i ? { ...c, status: 'calling' } : c
            ));

            // Make the call
            const success = await makeCall(candidate);

            // Update status
            setCandidates(prev => prev.map((c, idx) => 
                idx === i ? { ...c, status: success ? 'completed' : 'failed' } : c
            ));

            // Wait 30 seconds before next call (adjust as needed)
            if (i < candidates.length - 1 && !paused) {
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }

        setCalling(false);
        if (!paused) {
            alert('All calls completed!');
        }
    };

    const pauseCalling = () => {
        setPaused(true);
        setCalling(false);
    };

    const resumeCalling = () => {
        startCalling();
    };

    const resetImport = () => {
        setFile(null);
        setCandidates([]);
        setCurrentIndex(0);
        setCallResults({});
        setCalling(false);
        setPaused(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-gray-500 dark:text-gray-400';
            case 'calling': return 'text-blue-600 dark:text-blue-400';
            case 'completed': return 'text-green-600 dark:text-green-400';
            case 'failed': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'calling': return <Phone className="h-4 w-4 animate-pulse" />;
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'failed': return <XCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bulk Call Import</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Upload Excel file and automatically call candidates</p>
            </div>

            {/* Upload Section */}
            {!file && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                        <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload Excel File</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Excel file should contain a column named "phone", "phoneNumber", "mobile", or "number"
                        </p>
                        <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Candidates List */}
            {file && candidates.length > 0 && (
                <div className="space-y-4">
                    {/* Control Panel */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {candidates.length} Candidates Loaded
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Progress: {currentIndex + 1} / {candidates.length}
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                {!calling && !paused && (
                                    <button
                                        onClick={startCalling}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Start Calling
                                    </button>
                                )}
                                {calling && (
                                    <button
                                        onClick={pauseCalling}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                                    >
                                        <Pause className="h-4 w-4 mr-2" />
                                        Pause
                                    </button>
                                )}
                                {paused && (
                                    <button
                                        onClick={resumeCalling}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Resume
                                    </button>
                                )}
                                <button
                                    onClick={resetImport}
                                    disabled={calling}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Candidates Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Result</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {candidates.map((candidate, index) => (
                                    <tr key={candidate.id} className={index === currentIndex && calling ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{candidate.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{candidate.phoneNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`flex items-center space-x-2 text-sm font-medium ${getStatusColor(candidate.status)}`}>
                                                {getStatusIcon(candidate.status)}
                                                <span className="capitalize">{candidate.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {callResults[candidate.id]?.message || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkImport;

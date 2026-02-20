import React, { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, Pause, Play, PhoneOff, PhoneForwarded, Volume2, VolumeX } from 'lucide-react';

const ActiveCallScreen = () => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [showDialPad, setShowDialPad] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isOnHold) {
        setCallDuration(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isOnHold]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const dialPadNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Phone className="text-primary-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">John Doe</h2>
          <p className="text-gray-600 mb-2">+1 234-567-8900</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            {isOnHold ? 'On Hold' : 'Active Call'}
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-4xl font-bold text-gray-900">{formatTime(callDuration)}</p>
          <p className="text-sm text-gray-500 mt-1">Call Duration</p>
        </div>

        {showDialPad && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Dial Pad</h3>
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {dialPadNumbers.map((num) => (
                <button
                  key={num}
                  className="bg-white border border-gray-300 rounded-lg p-4 text-lg font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
              isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            <span className="text-xs mt-2">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setIsOnHold(!isOnHold)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
              isOnHold ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isOnHold ? <Play size={24} /> : <Pause size={24} />}
            <span className="text-xs mt-2">{isOnHold ? 'Resume' : 'Hold'}</span>
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
              isSpeakerOn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
            <span className="text-xs mt-2">Speaker</span>
          </button>

          <button
            onClick={() => setShowDialPad(!showDialPad)}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Phone size={24} />
            <span className="text-xs mt-2">Keypad</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="btn-secondary flex items-center justify-center">
            <PhoneForwarded size={20} className="mr-2" />
            Transfer
          </button>
          <button className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center">
            <PhoneOff size={20} className="mr-2" />
            End Call
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Call Notes</h4>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows="3"
            placeholder="Add notes about this call..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ActiveCallScreen;

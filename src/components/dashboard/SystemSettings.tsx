
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Input } from "@/components/ui/input";
import {
  Save,
  Mic,
  Video,
  Users,
  Radio,
  Clock,
  Trophy,
  BarChart3,
  Wifi,
  Settings
} from "lucide-react";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    micSettings: {
      maxDuration: 120,
      allowQueuing: true,
      requireApproval: true,
      maxQueueSize: 10
    },
    streamingSettings: {
      enableStreaming: true,
      audioQuality: "high",
      allowRecording: false,
      bufferTime: 5
    },
    gamificationSettings: {
      enabled: true,
      askQuestionPoints: 5,
      answerPollPoints: 3,
      speakingPoints: 10,
      feedbackPoints: 2
    },
    generalSettings: {
      autoCheckIn: true,
      notifyLowSeating: true,
      seatingThreshold: 10,
      realTimeUpdates: true
    }
  });

  const handleMicSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      micSettings: {
        ...settings.micSettings,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
      }
    });
  };

  const handleStreamingSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setSettings({
      ...settings,
      streamingSettings: {
        ...settings.streamingSettings,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
      }
    });
  };

  const handleGamificationSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      gamificationSettings: {
        ...settings.gamificationSettings,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
      }
    });
  };

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      generalSettings: {
        ...settings.generalSettings,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <AnimatedButton size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </AnimatedButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mic Sharing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Mic Sharing Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="maxDuration" className="block text-sm font-medium mb-1">
                Maximum Speaking Duration (seconds)
              </label>
              <Input
                id="maxDuration"
                name="maxDuration"
                type="number"
                value={settings.micSettings.maxDuration}
                onChange={handleMicSettingsChange}
              />
            </div>
            
            <div>
              <label htmlFor="maxQueueSize" className="block text-sm font-medium mb-1">
                Maximum Queue Size
              </label>
              <Input
                id="maxQueueSize"
                name="maxQueueSize"
                type="number"
                value={settings.micSettings.maxQueueSize}
                onChange={handleMicSettingsChange}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                id="allowQueuing"
                name="allowQueuing"
                type="checkbox"
                checked={settings.micSettings.allowQueuing}
                onChange={handleMicSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="allowQueuing" className="text-sm">
                Allow Queuing for Mic Requests
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                id="requireApproval"
                name="requireApproval"
                type="checkbox"
                checked={settings.micSettings.requireApproval}
                onChange={handleMicSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="requireApproval" className="text-sm">
                Require Approval for Mic Requests
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Live Streaming Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              Live Streaming Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="enableStreaming"
                name="enableStreaming"
                type="checkbox"
                checked={settings.streamingSettings.enableStreaming}
                onChange={handleStreamingSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="enableStreaming" className="text-sm">
                Enable Live Audio Streaming
              </label>
            </div>
            
            <div>
              <label htmlFor="audioQuality" className="block text-sm font-medium mb-1">
                Audio Quality
              </label>
              <select
                id="audioQuality"
                name="audioQuality"
                value={settings.streamingSettings.audioQuality}
                onChange={handleStreamingSettingsChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="low">Low (64 kbps)</option>
                <option value="medium">Medium (128 kbps)</option>
                <option value="high">High (256 kbps)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="bufferTime" className="block text-sm font-medium mb-1">
                Buffer Time (seconds)
              </label>
              <Input
                id="bufferTime"
                name="bufferTime"
                type="number"
                value={settings.streamingSettings.bufferTime}
                onChange={handleStreamingSettingsChange}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                id="allowRecording"
                name="allowRecording"
                type="checkbox"
                checked={settings.streamingSettings.allowRecording}
                onChange={handleStreamingSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="allowRecording" className="text-sm">
                Allow Recording of Live Sessions
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Gamification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Gamification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="enabled"
                name="enabled"
                type="checkbox"
                checked={settings.gamificationSettings.enabled}
                onChange={handleGamificationSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="enabled" className="text-sm">
                Enable Gamification Features
              </label>
            </div>
            
            <div>
              <label htmlFor="askQuestionPoints" className="block text-sm font-medium mb-1">
                Points for Asking a Question
              </label>
              <Input
                id="askQuestionPoints"
                name="askQuestionPoints"
                type="number"
                value={settings.gamificationSettings.askQuestionPoints}
                onChange={handleGamificationSettingsChange}
              />
            </div>
            
            <div>
              <label htmlFor="answerPollPoints" className="block text-sm font-medium mb-1">
                Points for Answering a Poll
              </label>
              <Input
                id="answerPollPoints"
                name="answerPollPoints"
                type="number"
                value={settings.gamificationSettings.answerPollPoints}
                onChange={handleGamificationSettingsChange}
              />
            </div>
            
            <div>
              <label htmlFor="speakingPoints" className="block text-sm font-medium mb-1">
                Points for Speaking on Mic
              </label>
              <Input
                id="speakingPoints"
                name="speakingPoints"
                type="number"
                value={settings.gamificationSettings.speakingPoints}
                onChange={handleGamificationSettingsChange}
              />
            </div>
            
            <div>
              <label htmlFor="feedbackPoints" className="block text-sm font-medium mb-1">
                Points for Submitting Feedback
              </label>
              <Input
                id="feedbackPoints"
                name="feedbackPoints"
                type="number"
                value={settings.gamificationSettings.feedbackPoints}
                onChange={handleGamificationSettingsChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="autoCheckIn"
                name="autoCheckIn"
                type="checkbox"
                checked={settings.generalSettings.autoCheckIn}
                onChange={handleGeneralSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="autoCheckIn" className="text-sm">
                Enable Automatic Check-In with QR
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                id="notifyLowSeating"
                name="notifyLowSeating"
                type="checkbox"
                checked={settings.generalSettings.notifyLowSeating}
                onChange={handleGeneralSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="notifyLowSeating" className="text-sm">
                Notify Attendees on Low Seating
              </label>
            </div>
            
            <div>
              <label htmlFor="seatingThreshold" className="block text-sm font-medium mb-1">
                Low Seating Threshold (%)
              </label>
              <Input
                id="seatingThreshold"
                name="seatingThreshold"
                type="number"
                value={settings.generalSettings.seatingThreshold}
                onChange={handleGeneralSettingsChange}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                id="realTimeUpdates"
                name="realTimeUpdates"
                type="checkbox"
                checked={settings.generalSettings.realTimeUpdates}
                onChange={handleGeneralSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="realTimeUpdates" className="text-sm">
                Enable Real-Time Data Updates
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { QrCode, Camera, CheckCircle } from "lucide-react";

interface QRCheckInProps {
  mode?: 'attendee' | 'organizer' | 'admin';
}

export default function QRCheckIn({ mode = 'attendee' }: QRCheckInProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendeeName, setAttendeeName] = useState('');

  // Simulate a QR code scan
  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate scan delay
    setTimeout(() => {
      setIsScanning(false);
      setIsCheckedIn(true);
      setAttendeeName('John Doe');
      
      // In a real app, the QR code would contain attendee information
      console.log('Attendee checked in: John Doe');
    }, 2000);
  };

  const resetCheckIn = () => {
    setIsCheckedIn(false);
    setAttendeeName('');
  };

  // For organizer/admin mode
  if (mode === 'organizer' || mode === 'admin') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-lg bg-secondary/30">
          <QrCode className="h-10 w-10 text-primary mb-2" />
          <p className="text-center text-sm text-muted-foreground">
            Scan attendee QR codes here to check them in
          </p>
        </div>
        
        <AnimatedButton 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>Scan QR Code</span>
            </>
          )}
        </AnimatedButton>
        
        <div className="border rounded-lg divide-y">
          <div className="p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                JD
              </div>
              <div>
                <p className="font-medium">Jane Doe</p>
                <p className="text-xs text-muted-foreground">VIP Ticket #1234</p>
              </div>
            </div>
            <span className="text-xs text-green-500">Checked in</span>
          </div>
          <div className="p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                AS
              </div>
              <div>
                <p className="font-medium">Alex Smith</p>
                <p className="text-xs text-muted-foreground">Regular Ticket #5678</p>
              </div>
            </div>
            <span className="text-xs text-green-500">Checked in</span>
          </div>
          {isCheckedIn && (
            <div className="p-3 flex justify-between items-center bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  JD
                </div>
                <div>
                  <p className="font-medium">{attendeeName}</p>
                  <p className="text-xs text-muted-foreground">Regular Ticket #9012</p>
                </div>
              </div>
              <span className="text-xs text-green-500">Just checked in</span>
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground flex justify-between pt-2">
          <span>Total checked in: {isCheckedIn ? 3 : 2}/50</span>
          <span>Last check-in: {isCheckedIn ? 'Just now' : '5 minutes ago'}</span>
        </div>
      </div>
    );
  }

  // Attendee view
  return (
    <div className="space-y-4">
      {isCheckedIn ? (
        <div className="bg-green-50 rounded-lg p-6 flex flex-col items-center justify-center space-y-3 dark:bg-green-900/20">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-800/30">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-center">Check-in Successful!</h3>
          <p className="text-sm text-center text-muted-foreground">
            Welcome to the event, {attendeeName}!
          </p>
          <AnimatedButton 
            variant="outline" 
            size="sm" 
            onClick={resetCheckIn}
          >
            Reset
          </AnimatedButton>
        </div>
      ) : (
        <>
          <div className="bg-primary/5 rounded-lg p-6 flex flex-col items-center justify-center">
            <QrCode className="h-24 w-24 text-primary mb-4" strokeWidth={1} />
            <p className="text-sm text-center text-muted-foreground">
              Show this QR code at the event entrance or scan an event QR code to check in
            </p>
          </div>
          
          <div className="flex space-x-2">
            <AnimatedButton 
              className="flex-1"
              onClick={handleScan}
              disabled={isScanning}
            >
              {isScanning ? 'Scanning...' : 'Check In'}
            </AnimatedButton>
            <AnimatedButton variant="outline" className="flex items-center gap-1">
              <Camera className="h-4 w-4" />
              <span>Scan</span>
            </AnimatedButton>
          </div>
        </>
      )}
    </div>
  );
}

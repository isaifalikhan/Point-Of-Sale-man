'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Info, CheckCircle2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  type?: 'danger' | 'info' | 'success' | 'warning';
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  type = 'info',
  loading = false
}: ConfirmationModalProps) {
  
  const getIcon = () => {
    switch (type) {
      case 'danger': return <Trash2 className="h-8 w-8 sm:h-10 sm:w-10 text-rose-500 bg-rose-50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl mb-3 sm:mb-4" />;
      case 'warning': return <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500 bg-amber-50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl mb-3 sm:mb-4" />;
      case 'success': return <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500 bg-emerald-50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl mb-3 sm:mb-4" />;
      default: return <Info className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-500 bg-indigo-50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl mb-3 sm:mb-4" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'bg-rose-600 hover:bg-rose-700 text-white font-bold sm:font-black';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 text-white font-bold sm:font-black';
      case 'success': return 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold sm:font-black';
      default: return 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold sm:font-black';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] border-none shadow-2xl p-5 sm:p-8 rounded-2xl sm:rounded-[32px]">
        <div className="flex flex-col items-center text-center">
          {getIcon()}
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5 sm:mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <DialogFooter className="mt-6 sm:mt-8 gap-2 sm:gap-3 sm:flex-row flex-col">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 sm:h-12 rounded-xl sm:rounded-2xl font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={() => {
              onConfirm();
            }}
            className={`flex-1 h-11 sm:h-12 rounded-xl sm:rounded-2xl transition-all active:scale-95 shadow-lg text-sm ${getButtonClass()}`}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface DialogContextType {
  openDialog: (
    type: boolean,
    callback: (comments: string, rating: number) => void
  ) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGood, setIsGood] = useState(true);
  const [rating, setRating] = useState(50);
  const [callback, setCallback] = useState<
    ((feedback: string, rating: number) => void) | null
  >(null);
  const [comments, setComments] = useState("");
  const openDialog = (
    type: boolean,
    callback: (comments: string, rating: number) => void
  ) => {
    setIsOpen(true);
    setIsGood(type);
    setRating(type ? 50 : 20);
    setCallback(
      () => (feedback: string, rating: number) => callback(feedback, rating)
    );
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(event.target.value);
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>
              Please provide a detailed feedback on why it is a{" "}
              <b>
                {isGood && "Good Response"}
                {!isGood && "Bad Response"}
              </b>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Textarea
                onChange={handleInput}
                className="col-span-3 resize-none"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (callback) callback(comments, rating);
                    closeDialog();
                  }
                }}
              />
              <Label htmlFor="name" className="text-right">
                Usefulness %
              </Label>
              <div className="relative w-full flex items-center">
                <Slider
                  defaultValue={[rating ?? 50]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setRating(value[0])}
                  className="w-full"
                />

                <div className="ml-3 relative">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
                    {rating}%
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={closeDialog} variant="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={async () => {
                if (callback) callback(comments, rating);
                closeDialog();
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

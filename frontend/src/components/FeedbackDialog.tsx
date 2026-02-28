import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { feedbackApi } from "@/lib/api-client";
import { useLocation } from "react-router-dom";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FeedbackDialog = ({ open, onOpenChange }: FeedbackDialogProps) => {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setSubmitting(true);
    try {
      await feedbackApi.submit({
        message: message.trim(),
        page: location.pathname,
      });
      toast.success("Thanks for your feedback!");
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            Help us improve
          </DialogTitle>
          <DialogDescription>
            Hope you find Simple Invoice Service useful. We'd love your feedback—what should we improve?
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Tell us what you think..."
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="resize-none"
          disabled={submitting}
        />
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!message.trim() || submitting} 
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Sending..." : "Send Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;

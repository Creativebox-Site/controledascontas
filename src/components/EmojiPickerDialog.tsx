import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EmojiPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPickerDialog = ({ open, onClose, onEmojiSelect }: EmojiPickerDialogProps) => {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Escolher Emoji</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width="100%"
            height={400}
            searchPlaceHolder="Buscar emoji..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

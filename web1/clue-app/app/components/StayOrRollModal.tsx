import React, { useState } from "react";
import Modal from "react-modal";

interface StayOrRollModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onRoll: (rollTotal: number) => void;
  onStay: () => void;
}

const StayOrRollModal: React.FC<StayOrRollModalProps> = ({
  isOpen,
  onRequestClose,
  onRoll,
  onStay,
}) => {
  const [rollResult, setRollResult] = useState<number | null>(null);

  const handleRoll = () => {
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const total = roll1 + roll2;
    setRollResult(total);
    onRoll(total);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Stay or Roll Modal"
      className="flex items-center justify-center h-full"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white p-6 rounded shadow-lg w-4/5 max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Do you want to Stay or Roll?
        </h2>
        {rollResult === null ? (
          <div className="flex justify-center space-x-4">
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded"
              onClick={handleRoll}
            >
              Roll
            </button>
            <button
              className="bg-gray-500 text-white py-2 px-4 rounded"
              onClick={onStay}
            >
              Stay
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold text-black">
              You rolled a {rollResult}
            </p>
            <button
              className="bg-green-500 text-white py-2 px-4 rounded mt-4"
              onClick={onRequestClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StayOrRollModal;

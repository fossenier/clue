import React from "react";
import Modal from "react-modal";

interface AccuseModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const AccuseModal: React.FC<AccuseModalProps> = ({
  isOpen,
  onRequestClose,
}) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Final Accused Modal"
    className="flex items-center justify-center h-full"
    overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div className="bg-white p-6 rounded shadow-lg w-4/5 max-w-5xl">
      <h2 className="text-xl font-semibold mb-4 text-center">Pick Cards</h2>
      <div className="flex justify-center space-x-4 mb-4">
        <div className="flex-1 w-1/3">
          <label className="block mb-2 text-center">Room</label>
          <select className="w-full p-4 border rounded text-center bg-white text-black">
            <option className="text-black">Conservatory</option>
            <option className="text-black">Library</option>
            <option className="text-black">Kitchen</option>
          </select>
        </div>
        <div className="flex-1 w-1/3">
          <label className="block mb-2 text-center">Suspect</label>
          <select className="w-full p-4 border rounded text-center bg-white text-black">
            <option className="text-black">Scarlet</option>
            <option className="text-black">Mustard</option>
            <option className="text-black">Peacock</option>
          </select>
        </div>
        <div className="flex-1 w-1/3">
          <label className="block mb-2 text-center">Weapon</label>
          <select className="w-full p-4 border rounded text-center bg-white text-black">
            <option className="text-black">Revolver</option>
            <option className="text-black">Candlestick</option>
            <option className="text-black">Rope</option>
          </select>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={onRequestClose}
        >
          Submit
        </button>
      </div>
    </div>
  </Modal>
);

export default AccuseModal;

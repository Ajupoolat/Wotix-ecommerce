import React from "react";

const AddressList = ({
  addresses = [],
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
        Your Addresses
      </h3>
      {addresses.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-gray-500 mb-4">
            No addresses found. Please add an address.
          </p>
          <button
            onClick={() => onEdit(null)} // Trigger form to add new address
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`border rounded-lg p-5 relative ${
                address.isDefault
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              } transition-all`}
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                  Default
                </span>
              )}
              <div className="mb-4">
                <h4 className="font-bold text-lg">{address.fullName}</h4>
                <p className="text-sm text-gray-600">
                  {address.phone}
                  {address.alternatePhone && `, ${address.alternatePhone}`}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-gray-700">{address.streetAddress}</p>
                {address.landmark && (
                  <p className="text-gray-700">Landmark: {address.landmark}</p>
                )}
                <p className="text-gray-700">
                  {address.city}, {address.state} - {address.postalCode}
                </p>
                <p className="text-gray-700">{address.country}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                {!address.isDefault && (
                  <button
                    onClick={() => onSetDefault(address._id)}
                    disabled={isSettingDefault}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    {isSettingDefault ? "Setting..." : "Set as Default"}
                  </button>
                )}
                <button
                  onClick={() => onEdit(address)}
                  disabled={isDeleting}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-all disabled:opacity-50 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => onDelete(address._id)}
                  className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;

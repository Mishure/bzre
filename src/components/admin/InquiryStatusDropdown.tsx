'use client';

import { useState } from 'react';

interface InquiryStatusDropdownProps {
  inquiryId: number;
  currentStatus: string;
}

export default function InquiryStatusDropdown({ inquiryId, currentStatus }: InquiryStatusDropdownProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setStatus(newStatus);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert('Eroare la actualizarea statusului');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Eroare la actualizarea statusului');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isUpdating}
      className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
    >
      <option value="NEW">Nouă</option>
      <option value="CONTACTED">Contactat</option>
      <option value="IN_PROGRESS">În progres</option>
      <option value="CLOSED">Închisă</option>
      <option value="SPAM">Spam</option>
    </select>
  );
}

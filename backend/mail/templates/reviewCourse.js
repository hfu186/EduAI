
export const courseStatusTemplate = (courseName, instructorName, status) => {
  const isPublished = status === "Published";
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
      <h2 style="color: ${isPublished ? '#059669' : '#e11d48'}; margin-top: 0;">
        Course Status Update
      </h2>
      <p>Dear <strong>${instructorName}</strong>,</p>
      <p>We are writing to provide you with an update regarding the status of your course on our platform:</p>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 6px solid ${isPublished ? '#10b981' : '#ef4444'}; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Course:</strong> ${courseName}</p>
        <p style="margin: 0;"><strong>New Status:</strong> 
          <span style="font-weight: bold; color: ${isPublished ? '#059669' : '#b91c1c'}; text-transform: uppercase;">
            ${isPublished ? 'APPROVED & PUBLISHED' : 'REVERTED TO DRAFT'}
          </span>
        </p>
      </div>

      <div style="color: #4b5563; font-size: 15px;">
        ${isPublished 
          ? `<p>Congratulations! Your course is now <strong>live</strong>. Students can now discover and enroll in your sessions.</p>` 
          : `<p>Your course has been moved back to <strong>Draft</strong> status. Please review your materials or check for admin feedback.</p>`
        }
      </div>

      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="font-size: 13px; color: #9ca3af;">Best regards,<br/><strong>Course Administration Team</strong></p>
    </div>
  `;
};
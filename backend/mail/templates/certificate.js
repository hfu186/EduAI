exports.certEmailTemplate = (userName, courseName, certLink) => {
  return `
    <div style="text-align: center; font-family: sans-serif;">
      <h2>🎉 CHÚC MỪNG TỐT NGHIỆP!</h2>
      <p>Chào ${userName}, bạn đã hoàn thành khóa học ${courseName}</p>
      
      <img src="https://res.cloudinary.com/demo/image/upload/v1234567/badge_completed.png" 
           alt="Huy hiệu hoàn thành" width="150" style="margin: 20px 0;"/>

      <div style="margin-top: 20px;">
        <a href="${certLink}" style="background: #FFD60A; padding: 10px 20px; color: #000; text-decoration: none; border-radius: 5px;">
          Tải bản PDF chính thức tại đây
        </a>
      </div>
    </div>
  `;
};
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>Social Network</h1>
    <div class="section">
        <h2>Giới thiệu</h2>
        <p>Dự án Social Network là một ứng dụng Web mạng xã hội cho phép người dùng đăng ký, đăng nhập, đăng bài viết, bình luận, kết bạn và nhắn tin. 
        Ứng dụng được xây dựng bằng Spring Boot, Spring Security (JWT Authentication), Spring JPA (ORM), MySQL, RESTful API, Swagger, WebSocket và ReactJS.</p>
    </div>
    <div class="section">
        <h2>Cấu trúc dự án</h2>
        <pre><code>Social-Network/
├── BE/ # Backend (Spring Boot)
│ ├── src/  
│ └── pom.xml # Cấu hình dependence
├── FE/ # Frontend (React)
│ └── social-network/
└── README.html # Tài liệu này</code></pre>
</div>
    <div class="section">
        <h2>Cách chạy chương trình</h2>
        <h3>Phương pháp: Chạy truyền thống</h3>
        <h4>Bước 1: Clone dự án từ Github:</h4>
        <pre><code>git clone https://github.com/napersau/social-networking-application.git</code></pre>
        <h4>Bước 2: Chạy ứng dụng</h4>
        <p>Thực hiện các bước sau:</p>
        <p><strong>Bên phía Front-end:</strong></p>
        <pre><code>cd FE/social-network
npm install
npm start</code></pre>
        <p><strong>Bên phía Back-end:</strong></p>
        <pre><code>Chạy trên IDE phù hợp (IntelliJ IDEA, Eclipse, VS Code...)</code></pre>
    </div>
    <div class="section">
        <h2>Truy cập ứng dụng</h2>
        <ul>
            <li><strong>Front-end:</strong> <code>http://localhost:3000</code></li>
            <li><strong>Back-end API:</strong> <code>http://localhost:8080</code></li>
            <li><strong>Swagger API Documentation:</strong> <code>http://localhost:8080/swagger-ui.html</code></li>
        </ul>
    </div>
    <div class="section">
        <h2>Kết quả sau khi chạy ứng dụng</h2>
        <div id="screenshots"></div>
    </div>
    <div class="section">
        <h2>Yêu cầu Phiên bản</h2>
        <ul>
            <li><strong>JDK:</strong> Phiên bản 17 trở lên</li>
            <li><strong>PostgreSql:</strong> Phiên bản 15 trở lên (Khuyến nghị: 15.4)</li>
            <li><strong>Node.js:</strong> Phiên bản 16 trở lên</li>
        </ul>
    </div>
    <script>
    const container = document.getElementById("screenshots");
    for (let i = 1; i <= 15; i++) {
        const img = document.createElement("img");
        img.src = `https://github.com/napersau/social-networking-application/blob/main/fe/public/img/${i}.png`;
        img.alt = `Ảnh Demo ${i}`;
        img.style = "max-width:100%; height:auto; border:1px solid #ddd; border-radius:5px; padding:5px;";
        container.appendChild(img);
        container.appendChild(document.createElement("br"));
        container.appendChild(document.createElement("br"));
    }
</script>
</body>
</html>

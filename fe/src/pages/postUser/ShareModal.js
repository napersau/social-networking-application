import React from "react";
import {
  Modal,
  Card,
  Avatar,
  Typography,
  Image,
  Input,
} from "antd";
import { UserOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

const ShareModal = ({
  visible,
  onCancel,
  onOk,
  loading,
  shareContent,
  setShareContent,
  selectedPost,
}) => {
  // Helper function để lấy images từ imageUrl hoặc media
  const getPostImages = (post) => {
    if (!post) return [];
    
    console.log('ShareModal - Checking images for post:', post.id);
    console.log('ShareModal - imageUrl:', post.imageUrl);
    console.log('ShareModal - media:', post.media);
    
    // Nếu có imageUrl, ưu tiên sử dụng imageUrl (logic cũ)
    if (post.imageUrl) {
      console.log('ShareModal - Using imageUrl:', post.imageUrl);
      return [post.imageUrl];
    }
    
    // Nếu imageUrl null, kiểm tra media array
    if (post.media && Array.isArray(post.media) && post.media.length > 0) {
      console.log('ShareModal - Checking media array, length:', post.media.length);
      
      // Lọc chỉ lấy media type là image - kiểm tra cả mediaType và type
      const imageUrls = post.media
        .filter(media => {
          console.log('ShareModal - Media item:', media);
          const isImage = (media.mediaType === 'IMAGE' || media.type === 'image') && (media.mediaUrl || media.url);
          console.log('ShareModal - Is image:', isImage);
          return isImage;
        })
        .map(media => media.mediaUrl || media.url);
      
      console.log('ShareModal - Filtered image URLs:', imageUrls);
      return imageUrls;
    }
    
    console.log('ShareModal - No images found');
    return [];
  };
  return (
    <Modal
      title="Chia sẻ bài viết"
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText="Chia sẻ"
      confirmLoading={loading}
    >
      <TextArea
        rows={4}
        placeholder="Viết nội dung chia sẻ..."
        value={shareContent}
        onChange={(e) => setShareContent(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      {selectedPost && (
        <Card size="small" bordered className="shared-post-preview">
          <div className="post-header">
            <Avatar
              size={32}
              src={selectedPost.user?.avatarUrl}
              icon={<UserOutlined />}
            />
            <div className="post-user-info" style={{ marginLeft: 8 }}>
              <Text strong>
                {selectedPost.user?.firstName} {selectedPost.user?.lastName}
              </Text>
              <div>
                <Text type="secondary" className="post-time">
                  {selectedPost.createdAt
                    ? new Date(selectedPost.createdAt).toLocaleString("vi-VN")
                    : "Vừa xong"}
                </Text>
              </div>
            </div>
          </div>

          <Paragraph style={{ marginTop: 12 }}>
            {selectedPost.content}
          </Paragraph>

          {(() => {
            const images = getPostImages(selectedPost);
            if (images.length === 0) return null;

            return (
              <div style={{ marginTop: 8 }}>
                {images.length === 1 ? (
                  <Image
                    src={images[0]}
                    width="100%"
                    style={{ borderRadius: 8 }}
                  />
                ) : (
                  <div className="preview-images-grid">
                    {images.slice(0, 3).map((imageUrl, index) => (
                      <Image
                        key={index}
                        src={imageUrl}
                        width={images.length === 2 ? "49%" : "32%"}
                        style={{ 
                          borderRadius: 4, 
                          marginRight: index !== images.length - 1 ? 8 : 0,
                          marginBottom: 4
                        }}
                      />
                    ))}
                    {images.length > 3 && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#65676b', 
                        textAlign: 'center',
                        marginTop: 4
                      }}>
                        +{images.length - 3} ảnh khác
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </Card>
      )}
    </Modal>
  );
};

export default ShareModal;
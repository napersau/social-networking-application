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

          {selectedPost.imageUrl && (
            <Image
              src={selectedPost.imageUrl}
              width="100%"
              style={{ borderRadius: 8, marginTop: 8 }}
            />
          )}
        </Card>
      )}
    </Modal>
  );
};

export default ShareModal;
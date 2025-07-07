import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  List,
  Avatar,
  Space,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Divider,
  Modal,
  Upload,
  Image,
} from "antd";
import {
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
  PlusOutlined,
  UserOutlined,
  PictureOutlined,
  SendOutlined,
  HeartOutlined,
  CommentOutlined,
  RetweetOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { postService } from "../../services/postService";
import "./styles.css";
import axios from "axios";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const PostPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await postService.getPosts();
      if (response.data && response.data.code === 1000) {
        setPosts(response.data.result);
      }
    } catch (error) {
      message.error("Không thể tải danh sách bài viết");
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostImageUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/v1/upload/post-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.code === 1000) {
        const imageUrl = response.data.result.url;

        // ❗ Chỉ set 1 ảnh duy nhất
        setUploadedImageUrl(imageUrl);
        setFileList([
          {
            uid: file.uid,
            name: file.name,
            status: "done",
            url: imageUrl,
          },
        ]);

        onSuccess(response.data.result);
      } else {
        onError(new Error("Upload thất bại"));
        message.error("Tải ảnh bài viết thất bại");
      }
    } catch (err) {
      console.error("Upload post image error:", err);
      onError(err);
      message.error("Có lỗi khi tải ảnh");
    }
  };

  const handleCreatePost = async (values) => {
    setCreateLoading(true);
    try {
      const postData = {
        content: values.content,
        imageUrl: uploadedImageUrl, // ✅ chỉ 1 ảnh
      };

      const response = await postService.createPost(postData);
      if (response.data && response.data.code === 1000) {
        message.success("Đăng bài viết thành công!");
        form.resetFields();
        setFileList([]);
        setUploadedImageUrl(null); // reset
        setIsModalVisible(false);
        fetchPosts();
      }
    } catch (error) {
      message.error("Đăng bài viết thất bại");
      console.error("Error creating post:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      message.info("Tính năng thích bài viết đang phát triển");
    } catch (error) {
      message.error("Lỗi khi thích bài viết");
    }
  };

  const handleComment = (postId) => {
    message.info("Tính năng bình luận đang phát triển");
  };

  const handleShare = (postId) => {
    message.info("Tính năng chia sẻ đang phát triển");
  };

  const PostCard = ({ post }) => (
    <Card className="post-card" hoverable>
      <div className="post-header">
        <Avatar size={40} src={post.userAvatar} icon={<UserOutlined />} />
        <div className="post-user-info">
          <Text strong>{post.username || "Anonymous"}</Text>
          <Text type="secondary" className="post-time">
            {post.createdAt
              ? new Date(post.createdAt).toLocaleString("vi-VN")
              : "Vừa xong"}
          </Text>
        </div>
      </div>

      <div className="post-content">
        <Paragraph>{post.content}</Paragraph>
        <div className="post-images">
          <Image src={post.imageUrl} className="post-image" />
        </div>
      </div>

      <Divider className="post-divider" />

      <div className="post-actions">
        <Button
          type="text"
          icon={<HeartOutlined />}
          onClick={() => handleLike(post.id)}
          className="action-button"
        >
          Thích {post.likes || 0}
        </Button>

        <Button
          type="text"
          icon={<CommentOutlined />}
          onClick={() => handleComment(post.id)}
          className="action-button"
        >
          Bình luận {post.comments || 0}
        </Button>

        <Button
          type="text"
          icon={<RetweetOutlined />}
          onClick={() => handleShare(post.id)}
          className="action-button"
        >
          Chia sẻ {post.shares || 0}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="post-page">
      <div className="post-container">
        <Row gutter={[16, 16]} justify="center">
          <Col span={16}>
            {/* Create Post Section */}
            <Card className="create-post-card">
              <div className="create-post-header">
                <Avatar size={40} icon={<UserOutlined />} />
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalVisible(true)}
                  className="create-post-button"
                >
                  Tạo bài viết mới
                </Button>
              </div>
            </Card>

            {/* Posts List */}
            <div className="posts-list">
              <Spin spinning={loading}>
                {posts.length === 0 && !loading ? (
                  <Card className="empty-posts">
                    <div className="empty-content">
                      <MessageOutlined className="empty-icon" />
                      <Title level={4}>Chưa có bài viết nào</Title>
                      <Text type="secondary">
                        Hãy tạo bài viết đầu tiên của bạn!
                      </Text>
                    </div>
                  </Card>
                ) : (
                  <List
                    dataSource={posts}
                    renderItem={(post) => (
                      <List.Item key={post.id} className="post-list-item">
                        <PostCard post={post} />
                      </List.Item>
                    )}
                    split={false}
                  />
                )}
              </Spin>
            </div>
          </Col>
        </Row>
      </div>

      {/* Create Post Modal */}
      <Modal
        title="Tạo bài viết mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        className="create-post-modal"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePost}>
          <Form.Item
            name="content"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung bài viết!" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Bạn đang nghĩ gì?"
              className="post-textarea"
            />
          </Form.Item>

          <Form.Item name="images" label="Thêm hình ảnh">
            <Upload
              listType="picture-card"
              fileList={fileList}
              customRequest={handlePostImageUpload}
              onRemove={() => {
                setFileList([]);
                setUploadedImageUrl(null);
              }}
              accept="image/*"
              maxCount={1} // ✅ chỉ 1 ảnh
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PictureOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createLoading}
                icon={<SendOutlined />}
              >
                Đăng bài
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostPage;

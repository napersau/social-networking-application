import React from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  Space,
  message,
} from "antd";
import {
  PictureOutlined,
  SendOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { postService } from "../../services/postService";

const { TextArea } = Input;

const CreatePostModal = ({
  isVisible,
  onCancel,
  createLoading,
  setCreateLoading,
  form,
  fileList,
  setFileList,
  uploadedMediaUrls,
  setUploadedMediaUrls,
  onPostCreated
}) => {
  
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
        
        // Thêm URL mới vào mảng uploadedMediaUrls
        setUploadedMediaUrls(prev => [...(prev || []), imageUrl]);
        
        // Cập nhật fileList để hiển thị ảnh đã upload
        setFileList(prev => [...prev, {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: imageUrl,
        }]);

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
        mediaUrls: uploadedMediaUrls || [], // Gửi mảng mediaUrls thay vì imageUrl đơn lẻ
      };

      const response = await postService.createPost(postData);
      if (response.data && response.data.code === 1000) {
        message.success("Đăng bài viết thành công!");
        form.resetFields();
        setFileList([]);
        setUploadedMediaUrls([]);
        onCancel();
        onPostCreated();
      }
    } catch (error) {
      message.error("Đăng bài viết thất bại");
      console.error("Error creating post:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    form.resetFields();
    setFileList([]);
    setUploadedMediaUrls([]);
  };

  return (
    <Modal
      title="Tạo bài viết mới"
      open={isVisible}
      onCancel={handleCancel}
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
            onRemove={(file) => {
              // Xóa ảnh khỏi fileList
              const newFileList = fileList.filter(item => item.uid !== file.uid);
              setFileList(newFileList);
              
              // Xóa URL tương ứng khỏi uploadedMediaUrls
              const newMediaUrls = (uploadedMediaUrls || []).filter(url => url !== file.url);
              setUploadedMediaUrls(newMediaUrls);
            }}
            accept="image/*"
            maxCount={5} // Cho phép tối đa 5 ảnh
          >
            {fileList.length >= 5 ? null : (
              <div>
                <PictureOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>Hủy</Button>
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
  );
};

export default CreatePostModal;
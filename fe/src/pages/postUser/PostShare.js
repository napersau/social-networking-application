import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Avatar,
  Divider,
  Typography,
  Image,
  Dropdown,
  Menu,
  message,
  Spin,
  Popover,
  Modal,
  List,
  Tabs,
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  RetweetOutlined,
  UserOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import { commentService } from "../../services/commentService";
import { likeService } from "../../services/likeService";
import { getMyInfo } from "../../services/userService";

const { Text, Paragraph } = Typography;

const PostShare = ({
  postShare,
  likingPosts,
  expandedComments,
  commentingPosts,
  setCommentingPosts,
  setPosts,
  commentForms,
  currentUser,
  onLike,
  onComment,
  onShare,
  onDeletePostShare,
  handleSubmitComment,
}) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [localCurrentUser, setLocalCurrentUser] = useState(null);

  // Modal danh sách reactions
  const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);
  const [postShareLikes, setPostShareLikes] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  console.log("comment",comments)

  // Fetch current user info if not provided via props
  useEffect(() => {
    if (!currentUser) {
      const fetchCurrentUser = async () => {
        try {
          const response = await getMyInfo();
          if (response.data && response.data.code === 1000) {
            setLocalCurrentUser(response.data.result);
          }
        } catch (error) {
          console.error("Error fetching current user info:", error);
        }
      };
      fetchCurrentUser();
    }
  }, [currentUser]);

  // Function to fetch comments for this post share
  const fetchComments = async () => {
    if (commentsLoaded || loadingComments || !postShare?.id) return;

    setLoadingComments(true);
    try {
      const response = await commentService.getCommentsByPostShareId(postShare.id);
      if (response.data && response.data.code === 1000) {
        setComments(response.data.result || []);
        setCommentsLoaded(true);
      } else {
        message.error("Không thể tải bình luận!");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      message.error("Đã xảy ra lỗi khi tải bình luận!");
    } finally {
      setLoadingComments(false);
    }
  };

  // Fetch comments when comment section is expanded
  useEffect(() => {
    if (expandedComments.has(postShare?.post?.id) && !commentsLoaded && postShare?.id) {
      fetchComments();
    }
  }, [expandedComments, commentsLoaded, postShare?.id, postShare?.post?.id]);

  // Fetch post share likes
  const fetchPostShareLikes = async () => {
    if (loadingLikes || !postShare?.id) return;

    setLoadingLikes(true);
    try {
      const response = await likeService.getPostShareLikes(postShare.id);
      if (response.data && response.data.code === 1000) {
        setPostShareLikes(response.data.result || []);
      } else {
        message.error("Không thể tải danh sách người thích!");
      }
    } catch (error) {
      console.error("Error fetching post share likes:", error);
      message.error("Đã xảy ra lỗi khi tải danh sách người thích!");
    } finally {
      setLoadingLikes(false);
    }
  };

  if (!postShare || !postShare.post) return null;

  const { user, sharedContent, createdAt, post } = postShare;
  const isLiking = likingPosts.has(post.id);
  
  // Reaction options giống Facebook
  const reactionOptions = [
    { type: "Like", icon: "👍", label: "Thích", color: "#1877f2" },
    { type: "Love", icon: "❤️", label: "Yêu thích", color: "#f33e58" },
    { type: "Haha", icon: "😂", label: "Haha", color: "#f7b125" },
    { type: "Wow", icon: "😮", label: "Wow", color: "#f7b125" },
    { type: "Sad", icon: "😢", label: "Buồn", color: "#f7b125" },
    { type: "Angry", icon: "😡", label: "Phẫn nộ", color: "#e9710f" },
  ];

  // Get reaction stats từ postShare
  const getReactionStats = () => {
    if (!postShare.likes || !Array.isArray(postShare.likes)) {
      return {
        totalCount: 0,
        topReactions: [],
        currentUserReaction: postShare.reactionType || null,
        reactionCounts: {},
      };
    }

    const reactionCounts = {};
    postShare.likes.forEach((reaction) => {
      const type = reaction.reactionType || "Like";
      reactionCounts[type] = (reactionCounts[type] || 0) + 1;
    });

    const sortedReactions = Object.entries(reactionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const topReactions = sortedReactions
      .map(([type]) => reactionOptions.find((r) => r.type === type))
      .filter(Boolean);

    return {
      totalCount: postShare.likes.length,
      topReactions,
      currentUserReaction: postShare.reactionType || null,
      reactionCounts,
    };
  };

  const { totalCount, topReactions, currentUserReaction, reactionCounts } = getReactionStats();
  const currentReaction = reactionOptions.find((r) => r.type === currentUserReaction);
  
  // Check if the post share itself is liked, not the original post
  const isLiked = postShare.isLiked || false;
  const likeCount = totalCount;
  const commentCount = comments.length || postShare.commentsCount || 0;
  const isCommentsExpanded = expandedComments.has(post.id);

  const postShareWithComments = {
    ...postShare,
    comments: comments,
    commentCount: comments.length,
  };

  // Handle default like action
  const handleDefaultLike = () => {
    if (currentUserReaction === "Like") {
      onLike(post.id, null, true, postShare.id);
    } else {
      onLike(post.id, "Like", true, postShare.id);
    }
  };

  // Reaction picker content
  const reactionContent = (
    <div className="reaction-box" style={{ 
      display: 'flex', 
      gap: '8px', 
      padding: '8px',
      background: 'white',
      borderRadius: '25px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      {reactionOptions.map((r) => (
        <Button
          key={r.type}
          type="text"
          className="reaction-item"
          onClick={() => onLike(post.id, r.type, true, postShare.id)}
          style={{
            padding: '4px 8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          <span style={{ fontSize: '20px' }}>{r.icon}</span>
        </Button>
      ))}
    </div>
  );

  // Render like count và comment count giống Facebook
  const renderCountSummary = () => {
    const commentCount = comments.length || postShare.commentsCount || 0;
    
    if (totalCount === 0 && commentCount === 0) return null;
    
    return (
      <div className="count-summary" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        fontSize: '13px',
        color: '#65676b'
      }}>
        <div className="left-counts">
          {totalCount > 0 && (
            <span
              className="like-count-text"
              style={{ cursor: 'pointer' }}
              title="Xem ai đã thả cảm xúc"
              onClick={() => {
                setIsReactionModalVisible(true);
                fetchPostShareLikes();
              }}
            >
              {totalCount === 1 ? '1 lượt thích' : `${totalCount} lượt thích`}
            </span>
          )}
        </div>
        <div className="right-counts">
          {commentCount > 0 && (
            <span
              className="comment-count-text"
              style={{ cursor: 'pointer' }}
              onClick={() => onComment(post.id)}
            >
              {commentCount === 1 ? '1 bình luận' : `${commentCount} bình luận`}
            </span>
          )}
        </div>
      </div>
    );
  };

  const myId = localStorage.getItem("userId");
  const isMyPost = user.id.toString() === myId;

  const menu = (
    <Menu
      items={[
        ...(isMyPost ? [
          {
            key: "edit",
            label: "Chỉnh sửa bài viết",
            onClick: () => console.log("Edit post share", postShare.id),
          },
          {
            key: "delete",
            label: <span style={{ color: "red" }}>Xóa bài viết</span>,
            onClick: () => onDeletePostShare(postShare.id),
          },
        ] : []),
      ]}
    />
  );

  return (
    <Card className="post-share-card" hoverable style={{ marginBottom: "20px" }}>
      {/* Header người chia sẻ */}
      <div className="post-header">
        <Avatar size={40} src={user.avatarUrl} icon={<UserOutlined />} />
        <div className="post-user-info">
          <Text strong>
            {user.firstName || "Anonymous"} {user.lastName || ""}
          </Text>
          <Text type="secondary" className="post-time">
            {createdAt
              ? format(new Date(createdAt), "dd/MM/yyyy HH:mm", { locale: vi })
              : "Vừa xong"}
          </Text>
          <Text type="secondary"> đã chia sẻ một bài viết</Text>
        </div>
        {isMyPost && (
          <Dropdown overlay={menu} trigger={["click"]}>
            <EllipsisOutlined style={{ fontSize: 20, cursor: "pointer" }} />
          </Dropdown>
        )}
      </div>

      {/* Nội dung người share viết thêm */}
      {sharedContent && (
        <>
          <Divider className="post-divider" />
          <Paragraph>{sharedContent}</Paragraph>
        </>
      )}

      <Divider className="post-divider" />

      {/* Bài gốc */}
      <Card type="inner" className="shared-post-inner" style={{ width: "100%" }}>
        <div className="post-header">
          <Avatar size={40} src={post.user.avatarUrl} icon={<UserOutlined />} />
          <div className="post-user-info">
            <Text strong>
              {post.user.firstName || "Anonymous"} {post.user.lastName || ""}
            </Text>
            <Text type="secondary" className="post-time">
              {post.createdAt
                ? format(new Date(post.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })
                : "Vừa xong"}
            </Text>
          </div>
        </div>

        <div className="post-content">
          <Paragraph>{post.content}</Paragraph>
          {post.imageUrl && (
            <div className="post-images">
              <Image
                src={post.imageUrl}
                className="post-image"
                placeholder={<div>Loading...</div>}
                onError={() => console.error("Failed to load image")}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Hiển thị số lượng like và comment */}
      {renderCountSummary()}

      {/* Actions giống post thường */}
      <Divider className="post-divider" />

      <div className="post-actions">
        {/* Nút Reaction với Popover */}
        <Popover content={reactionContent} trigger="hover" placement="top">
          <Button
            type="text"
            loading={isLiking}
            onClick={handleDefaultLike}
            className={`action-button ${currentUserReaction ? "reacted" : ""}`}
            style={{ color: currentReaction?.color || "#65676b" }}
            icon={
              currentReaction ? (
                <span className="reaction-emoji" style={{ fontSize: '16px' }}>{currentReaction.icon}</span>
              ) : (
                <HeartOutlined />
              )
            }
            aria-label={isLiked ? "Bỏ thích bài viết" : "Thích bài viết"}
          >
            <span className={`button-text ${currentUserReaction ? "reacted" : ""}`}>
              {currentUserReaction || "Thích"}
            </span>
          </Button>
        </Popover>

        <Button
          type="text"
          icon={<CommentOutlined />}
          onClick={() => onComment(post.id)}
          className={`action-button ${isCommentsExpanded ? "active" : ""}`}
          aria-label="Bình luận bài viết"
        >
          Bình luận
        </Button>

        <Button
          type="text"
          icon={<RetweetOutlined />}
          onClick={() => onShare(post)}
          className="action-button"
          aria-label="Chia sẻ bài viết"
        >
          Chia sẻ {post.sharesCount ? `(${post.sharesCount})` : ""}
        </Button>
      </div>

      {isCommentsExpanded && (
        <div style={{ marginTop: '16px' }}>
          {loadingComments ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin />
              <p>Đang tải bình luận...</p>
            </div>
          ) : (
            <div className="comment-section">
              {/* Comment Form */}
              <div className="comment-form" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Avatar size={32} src={(currentUser || localCurrentUser)?.avatarUrl} icon={<UserOutlined />} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        placeholder="Viết bình luận..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #d9d9d9',
                          borderRadius: '20px',
                          outline: 'none'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            handleSubmitComment(post.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button
                        type="primary"
                        size="small"
                        onClick={(e) => {
                          const input = e.target.closest('.comment-form').querySelector('input');
                          if (input.value.trim()) {
                            handleSubmitComment(post.id, input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Gửi
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              {comments.length > 0 && (
                <div className="comments-list">
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment-item" style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Avatar size={32} src={comment.user?.avatarUrl} icon={<UserOutlined />} />
                        <div style={{ flex: 1 }}>
                          <div style={{
                            background: '#f5f5f5',
                            padding: '8px 12px',
                            borderRadius: '18px',
                            display: 'inline-block'
                          }}>
                            <Text strong style={{ fontSize: '13px' }}>
                              {comment.user?.firstName} {comment.user?.lastName}
                            </Text>
                            <div style={{ marginTop: '2px' }}>
                              <Text>{comment.content}</Text>
                            </div>
                          </div>
                          <div style={{ marginTop: '4px', paddingLeft: '12px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {comment.createdAt
                                ? format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })
                                : "Vừa xong"}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal hiển thị danh sách reactions cho post share */}
      <Modal
        title="Người đã thả cảm xúc"
        open={isReactionModalVisible}
        onCancel={() => setIsReactionModalVisible(false)}
        footer={null}
        loading={loadingLikes}
      >
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: "all",
              label: `Tất cả (${postShareLikes.length})`,
              children: (
                <List
                  dataSource={postShareLikes}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar src={item.user?.avatarUrl}>
                            {item.user?.firstName?.[0]}
                          </Avatar>
                        }
                        title={`${item.user?.firstName || ""} ${
                          item.user?.lastName || ""
                        }`}
                        description={item.reactionType}
                      />
                    </List.Item>
                  )}
                />
              ),
            },
            ...Object.entries(
              postShareLikes.reduce((acc, like) => {
                const type = like.reactionType || "Like";
                if (!acc[type]) acc[type] = [];
                acc[type].push(like);
                return acc;
              }, {})
            ).map(([type, users]) => ({
              key: type,
              label: `${type} (${users.length})`,
              children: (
                <List
                  dataSource={users}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar src={item.user?.avatarUrl}>
                            {item.user?.firstName?.[0]}
                          </Avatar>
                        }
                        title={`${item.user?.firstName || ""} ${
                          item.user?.lastName || ""
                        }`}
                      />
                    </List.Item>
                  )}
                />
              ),
            })),
          ]}
        />
      </Modal>
    </Card>
  );
};

export default React.memo(PostShare);

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";
import {
  getFriendsRequests,
  getMyFriends,
  createFriendshipResponse,
} from "../../services/friendshipService";
import { createNotification } from "../../services/notificationService"; // ✅ Import thêm
import { CSSTransition, TransitionGroup } from "react-transition-group";

const Friendship = () => {
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const myId = localStorage.getItem("userId");

  const fetchFriendRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await getFriendsRequests();
      setRequests(response.data.result);
    } catch (error) {
      alert("Lỗi khi tải danh sách kết bạn");
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchMyFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await getMyFriends();
      setFriends(response.data.result);
    } catch (error) {
      alert("Lỗi khi tải danh sách bạn bè");
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleRespond = async (requestId, friendId, userId, accept) => {
    try {
      const status = accept ? "ACCEPTED" : "REJECTED";
      await createFriendshipResponse(friendId, userId, status);

      await createNotification({
        userId: userId,
        senderId: myId,
        title: "Phản hồi lời mời kết bạn",
        content: accept
          ? "Lời mời kết bạn của bạn đã được chấp nhận."
          : "Lời mời kết bạn của bạn đã bị từ chối.",
        actionUrl: `/profile/${myId}`,
        isRead: false,
      });

      alert(accept ? "Đã chấp nhận lời mời" : "Đã từ chối lời mời");

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      if (accept) fetchMyFriends();
    } catch (error) {
      alert("Lỗi khi xử lý yêu cầu");
    }
  };

  useEffect(() => {
    fetchFriendRequests();
    fetchMyFriends();
  }, []);


  return (
    <div className="friendship-container">
      <h2 className="friendship-title">Lời mời kết bạn</h2>
      {loadingRequests ? (
        <p className="loading">Đang tải lời mời...</p>
      ) : requests.length === 0 ? (
        <p className="empty">Không có lời mời kết bạn nào</p>
      ) : (
        <TransitionGroup component="ul" className="friendship-list">
          {requests.map((item) => (
            <CSSTransition key={item.id} timeout={300} classNames="fade">
              <li className="friendship-card">
                <Link
                  to={`/profile/${item.user.id}`}
                  className="friendship-link"
                >
                  <img
                    src={item.user.avatarUrl || "/default-avatar.png"}
                    alt={item.user.username}
                    className="friendship-avatar"
                  />
                  <div className="friendship-info">
                    <h3>
                      {item.user.lastName} {item.user.firstName}
                    </h3>
                    <p>Người dùng</p>
                  </div>
                </Link>
                <div className="friendship-actions">
                  <button
                    className="btn accept"
                    onClick={() =>
                      handleRespond(item.id, item.friend.id, item.user.id, true)
                    }
                  >
                    ✔ Chấp nhận
                  </button>
                  <button
                    className="btn reject"
                    onClick={() =>
                      handleRespond(
                        item.id,
                        item.friend.id,
                        item.user.id,
                        false
                      )
                    }
                  >
                    ✖ Từ chối
                  </button>
                </div>
              </li>
            </CSSTransition>
          ))}
        </TransitionGroup>
      )}

      <h2 className="friendship-title">Bạn bè của tôi</h2>
      {loadingFriends || myId === null ? (
        <p className="loading">Đang tải danh sách bạn bè...</p>
      ) : friends.length === 0 ? (
        <p className="empty">Bạn chưa có bạn bè nào</p>
      ) : (
        <ul className="friendship-list">
          {friends.map((f) => {
            const other = f.user.id == myId ? f.friend : f.user;
            return (
              <li key={other.id} className="friendship-card">
                <Link to={`/profile/${other.id}`} className="friendship-link">
                  <img
                    src={other.avatarUrl || "/default-avatar.png"}
                    alt={other.username}
                    className="friendship-avatar"
                  />
                  <div className="friendship-info">
                    <h3>
                      {other.lastName} {other.firstName}
                    </h3>
                    <p>Người dùng</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Friendship;

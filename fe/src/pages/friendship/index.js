import React, { useEffect, useState } from "react";
import "./styles.css";
import {
  getFriendsRequests,
  createFriendshipResponse,
} from "../../services/friendshipService";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const Friendship = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const response = await getFriendsRequests();
      setRequests(response.data.result);
    } catch (error) {
      alert("Lỗi khi tải danh sách kết bạn");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, friendId, userId, accept) => {
    try {
      const status = accept ? "ACCEPTED" : "REJECTED";
      await createFriendshipResponse(friendId, userId, status);
      alert(accept ? "Đã chấp nhận lời mời" : "Đã từ chối lời mời");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      alert("Lỗi khi xử lý yêu cầu");
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  return (
    <div className="friendship-container">
      <h2 className="friendship-title">Lời mời kết bạn</h2>
      {loading ? (
        <p className="loading">Đang tải...</p>
      ) : requests.length === 0 ? (
        <p className="empty">Không có lời mời kết bạn nào</p>
      ) : (
        <TransitionGroup component="ul" className="friendship-list">
          {requests.map((item) => (
            <CSSTransition
              key={item.id}
              timeout={300}
              classNames="fade"
            >
              <li className="friendship-card">
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
                      handleRespond(item.id, item.friend.id, item.user.id, false)
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
    </div>
  );
};

export default Friendship;

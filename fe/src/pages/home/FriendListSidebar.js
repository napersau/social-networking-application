import React, { useEffect, useState } from "react";
import { getMyFriends } from "../../services/friendshipService";
import { List, Avatar, Spin, Typography, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";


const { Title } = Typography;

function FriendListSidebar() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const response = await getMyFriends();
        console.log("response",response)
        if (response && response.data && Array.isArray(response.data.result)) {
          setFriends(response.data.result);
        } else {
          setFriends([]);
        }
      } catch (error) {
        console.error("Failed to fetch friends:", error);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="friend-sidebar">
      <Title level={5} className="friend-title">Người liên hệ</Title>
      <Spin spinning={loading}>
        {friends.length === 0 ? (
          <Empty description="Không có bạn bè" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={friends}
            renderItem={(friend) => (
              <List.Item key={friend.id} className="friend-item">
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={friend.user.avatarUrl}
                      icon={<UserOutlined />}
                      size={40}
                    />
                  }
                  title={
                    <a href={`/profile/${friend.id}`}>
                      {(friend.user.lastName || "") + " " + (friend.user.firstName || "")}
                    </a>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </div>
  );
}

export default FriendListSidebar;

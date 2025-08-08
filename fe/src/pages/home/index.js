import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Button,
  List,
  Avatar,
  Spin,
  Empty,
  Alert,
} from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { searchUsersByFullName } from "../../services/userService";
import FriendListSidebar from "../../components/conversation";
import "./styles.css";

const { Title, Paragraph } = Typography;
const { Search } = Input;

function Home() {
  // --- State Management ---
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const myId = localStorage.getItem("userId");

  // --- Debounce function for search ---
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // --- Search function ---
  const performSearch = async (keyword) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await searchUsersByFullName(keyword);
      if (response && response.data && response.data.result) {
        const filteredResults = response.data.result.filter(
          (user) => String(user.id) !== myId
        );
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error searching for users:", err);
      setError("An error occurred while searching. Please try again.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Debounced search ---
  const debouncedSearch = useCallback(debounce(performSearch, 300), []);


  // --- Handle input change ---
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    debouncedSearch(value);
  };

  // --- Handle search on Enter ---
  const handleSearch = async (value) => {
    const keyword = value.trim();
    if (!keyword) {
      setSearchResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await searchUsersByFullName(keyword);
      if (response && response.data && response.data.result) {
        setSearchResults(response.data.result);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error searching for users:", err);
      setError("An error occurred while searching. Please try again.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // --- UI Rendering ---
  return (
    <div className="home-container">
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={16} xl={14}>
          {/* Search Card */}
          <Card title="Tìm kiếm người dùng" className="search-card">
            <Paragraph type="secondary" className="search-description">
              Nhập tên đầy đủ của người dùng bạn muốn tìm kiếm trong hệ thống.
            </Paragraph>
            <Search
              placeholder="Nhập tên đầy đủ..."
              enterButton={
                <>
                  <SearchOutlined /> Tìm kiếm
                </>
              }
              size="large"
              value={searchKeyword}
              onChange={handleInputChange}
              onSearch={handleSearch}
              loading={loading}
              className="search-input"
            />

            {/* Error Display */}
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                className="error-alert"
              />
            )}

            {/* Results Section */}
            <Spin spinning={loading} tip="Đang tìm kiếm...">
              {searched && !loading && searchResults.length === 0 ? (
                <Empty description="Không tìm thấy người dùng nào phù hợp." />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={searchResults}
                  renderItem={(user) => (
                    <List.Item key={user.id} className="user-list-item">
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={user.avatarUrl}
                            icon={<UserOutlined />}
                            size={48}
                          />
                        }
                        title={
                          <a href={`/profile/${user.id}`}>
                            {user.firstName || user.lastName
                              ? `${user.firstName || ""} ${
                                  user.lastName || ""
                                }`.trim()
                              : "Tên không xác định"}
                          </a>
                        }
                      />
                      <Button type="default" className="profile-button">
                        Xem hồ sơ
                      </Button>
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
      <FriendListSidebar />
    </div>
  );
}

export default Home;

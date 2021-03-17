import styled from "styled-components";
import { useState, useEffect } from "react";
import { API, Auth } from "aws-amplify";
import { useNavigate } from "@reach/router";

const VideoWrapper = styled.div`
  border: 1px solid #525252;
  display: flex;
  height: 250px;
  margin: 10px 0;

  & > img {
    width: 30%;
  }

  & > div {
    width: 70%;
    padding: 0 10px 10px 10px;
  }
`;

function VideosList({ data }) {
  const { videos } = data;
  const navigate = useNavigate();

  return videos.map((el) => {
    let {
      videoId,
      title,
      thumbnail,
      createdAt,
      upvotesCount,
      downvotesCount,
      tier,
    } = el;
    title = title.replace(/_|(.mp4|.mkv|.avi)/g, " ");

    return (
      <VideoWrapper key={videoId} onClick={() => navigate(`watch/${videoId}`)}>
        <img src={thumbnail} alt={title} />
        <div>
          <h4>{title}</h4>
          <h5>Subscription - {tier}</h5>
          <small>Uploaded at: {createdAt}</small>
          <br />
          <small>Upvotes: {upvotesCount}</small>
          <br />
          <small>Downvotes: {downvotesCount}</small>
        </div>
      </VideoWrapper>
    );
  });
}

const VideoList = styled.section`
  width: 90vw;
  padding: 25px 0;
  margin: 0 auto;
`;

function Home({ user, authState }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchList = async () => {
      let headers = {
        "Content-Type": "application/json",
      };

      if (user) {
        console.info("Auth route.");
      } else {
        console.info("Guest route.");
        // console.log(await Auth.currentCredentials());
      }

      const res = await API.get("testApi", "/api/list-videos", {
        headers: headers,
        auth: {
          type: "AWS_IAM",
        },
      });

      console.log(res);
      setData(res);
    };

    if (Object.keys(data).length > 0) {
      return;
    } else {
      fetchList();
    }
  });

  // console.log(data, "fetched data");
  // console.log(user, "user");

  const handleTest = async () => {
    // let user = await Auth.currentAuthenticatedUser();

    try {
      let result = await Auth.updateUserAttributes(user, {
        gender: "Lolz",
        "custom:smth": "waaaa",
      });
      console.log(result); // SUCCESS
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <VideoList>
      {data?.videos?.length ? <VideosList data={data} /> : null}

      <div
        onClick={() => {
          handleTest();
        }}
      >
        Test
      </div>
    </VideoList>
  );
}

export default Home;

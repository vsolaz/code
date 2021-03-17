import styled from "styled-components";
import ReactPlayer from "react-player/lazy";
import { useState, useEffect } from "react";
import { Auth, API } from "aws-amplify";
import { Link, useParams, navigate } from "@reach/router";

const VideoWrapper = styled.section`
  width: 90vw;
  padding: 25px 0;
  margin: 0 auto;

  & > .back {
    text-decoration: none;
    color: #525252;
  }

  & > .player {
    width: 80vw;
    margin: 0 auto;
  }

  & > .actions {
    width: 100%;
    margin: 0 auto;
    display: flex;

    & > div {
      width: 50%;
      display: flex;
      align-items: center;
      font-size: 25px;
      padding: 10px 20px;
    }

    & svg:hover {
      cursor: pointer;
    }

    & > div:first-child {
      display: flex;
      flex-direction: row-reverse;
      justify-content: right;
      align-items: center;
    }
  }
`;

function Video({ user }) {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const params = useParams();

  useEffect(() => {
    if (Object.keys(data).length > 0 || user === null || error !== null) {
      return;
    }
    const fetchList = async () => {
      let headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
      };

      try {
        const res = await API.get(
          "testApi",
          `/api/video?videoId=${params.videoId}`,
          {
            headers: headers,
          }
        );

        setData(res);
      } catch (error) {
        console.error(error);
        setError("response" in error ? error.response.data : error);
      }
    };

    fetchList();
  }, [data, params.videoId, user, error]);

  const handleVote = async (action) => {
    let headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`,
    };

    const res = await API.post("testApi", `/api/vote`, {
      headers: headers,
      body: {
        videoId: params.videoId,
        action: action,
      },
    });

    // console.log(res);
    if ("CancellationReasons" in res) {
      window.alert("You have already casted a vote for this video!");
      return;
    }

    let newData = Object.assign({}, data);
    if (action === "upvote") {
      newData.upvotesCount = data.upvotesCount + 1;
    } else {
      newData.downvotesCount = data.downvotesCount + 1;
    }
    setData(newData);
  };

  // If data.lenght then render list items
  // console.log(user);
  // console.log(data);

  if (user && error) {
    return (
      <VideoWrapper>
        <Link className="back" to="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="#525252"
          >
            <path d="M0 12l9-8v6h15v4h-15v6z" />
          </svg>
          Back
        </Link>
        <p>
          {error?.Message === "Unauthorized, wrong tier."
            ? "Upgrade your membership to watch this video!"
            : "An Unknown error occurred, please retry."}
        </p>
      </VideoWrapper>
    );
  }

  if (!user) {
    navigate("/signin");
  }

  if (Object.keys(data).length === 0) {
    return <small>Loading</small>;
  }

  let { title, videoUrls, upvotesCount, downvotesCount, tier } = data;
  title = title.replace(/_|(.mp4|.mkv|.avi)/g, " ");

  return (
    <VideoWrapper>
      <Link className="back" to="/">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="#525252"
        >
          <path d="M0 12l9-8v6h15v4h-15v6z" />
        </svg>
        Back
      </Link>

      <h2>{title}</h2>
      <h4>Subscription: {tier}</h4>
      <ReactPlayer url={videoUrls.hls} controls className="player" />
      <div className="actions">
        <div>
          <svg
            title="Upvote!"
            onClick={() => handleVote("upvote")}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#525252"
          >
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.308 11.794c.418.056.63.328.63.61 0 .323-.277.66-.844.705-.348.027-.434.312-.016.406.351.08.549.326.549.591 0 .314-.279.654-.913.771-.383.07-.421.445-.016.477.344.026.479.146.479.312 0 .466-.826 1.333-2.426 1.333-2.501.001-3.407-1.499-6.751-1.499v-4.964c1.766-.271 3.484-.817 4.344-3.802.239-.831.39-1.734 1.187-1.734 1.188 0 1.297 2.562.844 4.391.656.344 1.875.468 2.489.442.886-.036 1.136.409 1.136.745 0 .505-.416.675-.677.755-.304.094-.444.404-.015.461z" />
          </svg>
          {upvotesCount}
        </div>
        <div>
          {downvotesCount}
          <svg
            title="Downvote!"
            onClick={() => handleVote("downvote")}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#525252"
          >
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.323 12.667c.261.08.677.25.677.755 0 .336-.25.781-1.136.745-.614-.025-1.833.099-2.489.442.453 1.829.344 4.391-.844 4.391-.797 0-.948-.903-1.188-1.734-.859-2.985-2.577-3.532-4.343-3.802v-4.964c3.344 0 4.25-1.5 6.752-1.5 1.6 0 2.426.867 2.426 1.333 0 .167-.136.286-.479.312-.405.031-.367.406.016.477.634.117.913.457.913.771 0 .265-.198.511-.549.591-.418.095-.332.379.016.406.566.045.844.382.844.705 0 .282-.212.554-.63.61-.43.058-.29.368.014.462z" />
          </svg>
        </div>
      </div>
    </VideoWrapper>
  );
}

export default Video;

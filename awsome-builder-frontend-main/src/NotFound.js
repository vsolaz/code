import { useNavigate } from "@reach/router";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1>404 - Those are not the droids you are looking for.</h1>
      <p onClick={() => navigate(-1)}>Back</p>
    </>
  );
};

export default NotFound;

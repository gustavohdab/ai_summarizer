import { useState, useEffect } from "react";

import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";

const Demo = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });
  const [allArticles, setAllArticles] = useState([]);
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();
  const [copied, setCopied] = useState(false);
  const [showFullLink, setShowFullLink] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    const articleFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    );

    if (articleFromLocalStorage) {
      setAllArticles(articleFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await getSummary({ articleUrl: article.url });

    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updateAllArticles = [...allArticles, newArticle];

      setArticle(newArticle);
      setAllArticles(updateAllArticles);

      console.log(newArticle);

      localStorage.setItem("articles", JSON.stringify(updateAllArticles));
    }
  };

  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    setTooltipVisible(true);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => {
      setCopied(false);
      setTooltipVisible(false);
    }, 3000);
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      {/*Search */}
      <div className=" flex flex-col w-full gap-2">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link_icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />

          <input
            type="url"
            placeholder="Enter your URL"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            required
            className="url_input peer"
          />

          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700 hover:bg-gray-100"
          >
            <p>↵</p>
          </button>
        </form>

        {/*Browse URL History */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.map((article, index) => (
            <div
              key={`link-${index}`}
              onClick={() => setArticle(article)}
              className="link_card relative flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100"
            >
              <div
                className="copy_btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(article.url);
                }}
              >
                <img
                  src={copied === article.url ? tick : copy}
                  alt="copy_icon"
                  className="w-[40%] h-[40%] object-contain"
                />
                {tooltipVisible && copied === article.url && (
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-blue-500 rounded animate-pulse">
                    Copied!
                  </span>
                )}
              </div>
              <p className="flex-1 font-satoshi text-blue-700 text-sm truncate">
                {showFullLink === index ? (
                  article.url
                ) : article.url.length > 50 ? (
                  <span>
                    {article.url.slice(0, 50)}...
                    <span
                      className="text-gray-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullLink(index);
                      }}
                    >
                      {" "}
                      (click to view full link)
                    </span>
                  </span>
                ) : (
                  article.url
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/*Display Results */}
      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className=" font-inter font-bold text-black text-center">
            Well, that wasn`t supposed to happen. Please try again.
            <br />
            <span className="font-satoshi font-normal text-gray-700">
              {error?.data?.error}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Article <span className="blue_gradient">Summary</span>
              </h2>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-700">
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;

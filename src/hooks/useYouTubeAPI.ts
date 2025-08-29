import { useEffect, useState } from "react";

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const useYouTubeAPI = () => {
  const [youTubeAPIReady, setYouTubeAPIReady] = useState(false);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('🎬 YouTube IFrame API Ready');
        setYouTubeAPIReady(true);
      };
    } else if (window.YT && window.YT.Player) {
      setYouTubeAPIReady(true);
    }
  }, []);

  return { youTubeAPIReady };
};

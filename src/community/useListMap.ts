import { useQuery } from "react-query";
import { listMap } from "../api/map";
import toast from "react-hot-toast";

import { preloadImage } from "../utils";

export const useListMap = ({ offset = 0, limit = 10, search = '' }) => {
  const { data, isLoading } = useQuery(["list-map", limit, offset, search], {
    queryFn: () => listMap({ limit, offset, search }),
    onError: (err) => {
      console.error(err);
      toast.error("Unable to retrieve community maps");
    },
  });

  const preloadImages = async () => {
    if (isLoading) return;
    try {
      const maps = data.data || [];
      const preloads = await Promise.all(
        maps.map((map) => {
          return preloadImage(map.imageUrl)
            .then(() => true)
            .catch((err) => {
              console.warn(
                `Unable to load map image for ${map.name}, id=${map.id}, url=${map.imageUrl}`
              );
              return false;
            });
        })
      );
      return maps.reduce((acc, map, i) => {
        acc[map.id] = preloads[i];
        return acc;
      }, {} as Record<string, boolean>);
    } catch (err) {
      console.log(err);
    }
  }

  const { data: loadedImageMap = {}, isLoading: isLoadingImages } = useQuery(
    ["load-images", data, isLoading],
    {
      queryFn: async () => preloadImages(),
      onError: (err) => {
        console.error(err);
      },
    }
  );

  const defaultMeta = {
    numResults: 0,
    totalItems: 0,
  };

  return {
    isLoading: isLoading || isLoadingImages,
    data: data?.data || [],
    meta: data?.meta || defaultMeta,
    loadedImageMap,
  };
};

import React, { useEffect, useState } from "react"
import ReactPaginate from 'react-paginate';

import { Stack } from "../editor/components/Stack";
import { useListMap } from "./useListMap";
import { MapCard } from "./MapCard";
import { clamp } from "../utils";

import * as styles from './Community.css';
import * as editorStyles from '../editor/Editor.css'
import { Field } from "../editor/components/Field";

export const MapList = () => {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchText);
    }, 200);
    return () => {
      clearTimeout(t);
    }
  }, [searchText])

  const {data, meta, loadedImageMap, isLoading} = useListMap({ offset, limit, search });

  const pageCount = Math.ceil(meta.totalItems / limit) || 1;

  const handlePageClick = (event: { selected: number }) => {
    const pageIndex = clamp(event.selected, 0, pageCount - 1);
    const newOffset = pageIndex * limit;
    setOffset(newOffset);
  };

  const list = data.length ? (
    <div className={styles.mapList}>
      {data.map((map) => (
        <MapCard
          key={map.id}
          map={map}
          isImageLoaded={loadedImageMap[map.id]}
        />
      ))}
    </div>
  ) : (
    <div className={styles.mapListEmpty}>No results</div>
  );

  return (
    <div style={{ width: "100%" }}>
      <Stack>
        <Field
          label="search maps"
          name="search"
          type="text"
          placeholder="search by map name..."
          value={searchText}
          onChange={(val) => setSearchText(val)}
          inputClassName={styles.searchMapInput}
        />
      </Stack>
      <div
        className="position-relative"
        style={{ minHeight: 300, width: "100%" }}
      >
        {isLoading ? (
          <div className={styles.mapListLoadingOverlay}>
            <Stack>
              <p
                className="minimood"
                style={{ transform: "translate(-10px, 5px)" }}
              >
                loading
              </p>
              <span className={editorStyles.loader30}></span>
            </Stack>
          </div>
        ) : (
          list
        )}
      </div>

      <Stack row style={{ marginTop: 30, marginBottom: 30 }} justify="spaceBetween">
        <p>
          {Math.min(offset + 1, meta.totalItems)}-{offset + meta.numResults} of {meta.totalItems} results
        </p>
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="<"
          className={styles.paginationContainer}
          pageClassName={styles.page}
          pageLinkClassName={styles.pageLink}
          activeClassName={styles.active}
          activeLinkClassName={styles.activeLink}
          previousClassName={styles.prev}
          nextClassName={styles.next}
          disabledClassName={styles.disabled}
        />
      </Stack>
      <div style={{ marginBottom: 60 }} />
    </div>
  );
}

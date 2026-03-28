import React, { useEffect } from "react";
import { TagsInput } from "react-tag-input-component";

type IPropType = {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  default_value?: string[];
};
const Tags = ({ tags, setTags, default_value }: IPropType) => {
  useEffect(() => {
    if (default_value && default_value.length > 0) {
      // Mevcut tags ile default_value içeriği aynı mı kontrol et
      const isSame = JSON.stringify(tags) === JSON.stringify(default_value);

      if (!isSame) {
        setTags(default_value);
      }
    }
    // Bağımlılık dizisine 'tags' eklemek zorundayız çünkü yukarıda karşılaştırıyoruz
  }, [default_value, setTags, tags]);

  return (
    <div className="mb-5 tp-product-tags">
      <TagsInput
        value={tags}
        onChange={setTags}
        name="tags"
        placeHolder="enter tags"
      />
      <em>press enter to add new tag</em>
    </div>
  );
};

export default Tags;

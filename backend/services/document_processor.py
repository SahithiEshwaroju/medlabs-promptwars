import os
import pypdf

class DocumentProcessor:
    @staticmethod
    def extract_text_from_file(file_path: str) -> dict:
        """
        Extracts text page by page from PDF or text file.
        Returns: {
            "total_pages": int,
            "pages": [{"page_number": int, "text": str}],
            "full_text": str
        }
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        file_ext = os.path.splitext(file_path)[1].lower()
        pages = []
        full_text_list = []

        if file_ext == ".pdf":
            try:
                reader = pypdf.PdfReader(file_path)
                total_pages = len(reader.pages)
                for idx, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    pages.append({
                        "page_number": idx + 1,
                        "text": text
                    })
                    full_text_list.append(text)
            except Exception as e:
                # Fallback for empty/corrupted pdf or mock parser
                pages.append({
                    "page_number": 1,
                    "text": f"Error parsing PDF text: {str(e)}"
                })
                total_pages = 1
        elif file_ext in [".txt", ".csv", ".json"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
                pages.append({"page_number": 1, "text": text})
                full_text_list.append(text)
                total_pages = 1
        else:
            # Images or binary mock fallback
            text = f"[Extracted document contents from image/file: {os.path.basename(file_path)}]"
            pages.append({"page_number": 1, "text": text})
            full_text_list.append(text)
            total_pages = 1

        return {
            "total_pages": total_pages,
            "pages": pages,
            "full_text": "\n\n".join(full_text_list)
        }

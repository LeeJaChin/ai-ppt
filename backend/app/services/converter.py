import logging
import os
import sys
from pathlib import Path
from typing import Optional
import subprocess

# 设置库路径以解决 macOS 上的 GDI+ 库问题
if sys.platform == "darwin":  # macOS
    lib_path = "/opt/homebrew/lib"
    if os.path.exists(lib_path):
        os.environ.setdefault("DYLD_LIBRARY_PATH", lib_path + ":" + os.environ.get("DYLD_LIBRARY_PATH", ""))
    else:
        # 对于其他 Homebrew 安装位置的备选方案
        alt_lib_paths = [
            "/usr/local/lib",
            "/opt/homebrew/lib"
        ]
        for path in alt_lib_paths:
            if os.path.exists(path):
                os.environ.setdefault("DYLD_LIBRARY_PATH", path + ":" + os.environ.get("DYLD_LIBRARY_PATH", ""))
                break

try:
    import aspose.slides as slides
except ImportError as e:
    slides = None
    logging.warning(f"Failed to import aspose.slides: {e}")

try:
    import aspose.words as words
except ImportError as e:
    words = None
    logging.warning(f"Failed to import aspose.words: {e}")

# 尝试导入其他可能的转换库
try:
    from pdf2docx import Converter as PdfToDocxConverter
except ImportError:
    PdfToDocxConverter = None

try:
    from pptx import Presentation
    from pptx.util import Inches
except ImportError:
    Presentation = None
    Inches = None

logger = logging.getLogger(__name__)

class FileConverter:
    """文件转换器类，支持多种文档格式转换"""
    
    def __init__(self):
        self.supported_formats = {
            'ppt_to_pdf': ['.ppt', '.pptx'],
            'word_to_pdf': ['.doc', '.docx'],
            'pdf_to_word': ['.pdf'],
            'pdf_to_ppt': ['.pdf']
        }
    
    def ppt_to_pdf(self, input_path: str, output_path: str) -> bool:
        """
        使用 Aspose.Slides 将 PPT/PPTX 转换为 PDF
        
        Args:
            input_path: 输入 PPT/PPTX 文件路径
            output_path: 输出 PDF 文件路径
            
        Returns:
            bool: 转换是否成功
        """
        logger.info(f"开始转换 PPT 文件: {input_path} -> {output_path}")
        
        if slides is None:
            logger.error("Aspose.Slides not available")
            return False
            
        try:
            # 加载演示文稿
            pres = slides.Presentation(input_path)
            
            # 保存为 PDF
            pres.save(output_path, slides.export.SaveFormat.PDF)
            
            logger.info(f"PPT 转 PDF 成功: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"PPT 转 PDF 失败: {str(e)}")
            # 如果 aspose 失败，尝试使用 unoconv 作为备选方案
            return self._fallback_ppt_to_pdf_with_unoconv(input_path, output_path)
    
    def word_to_pdf(self, input_path: str, output_path: str) -> bool:
        """
        使用 Aspose.Words 将 Word 文档转换为 PDF
        
        Args:
            input_path: 输入 Word 文件路径
            output_path: 输出 PDF 文件路径
            
        Returns:
            bool: 转换是否成功
        """
        logger.info(f"开始转换 Word 文件: {input_path} -> {output_path}")
        
        if words is None:
            logger.error("Aspose.Words not available")
            return False
            
        try:
            # 加载文档
            doc = words.Document(input_path)
            
            # 保存为 PDF
            doc.save(output_path, words.SaveFormat.PDF)
            
            logger.info(f"Word 转 PDF 成功: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Word 转 PDF 失败: {str(e)}")
            return False
    
    def pdf_to_word(self, input_path: str, output_path: str) -> bool:
        """
        将 PDF 转换为 Word 文档
        
        Args:
            input_path: 输入 PDF 文件路径
            output_path: 输出 Word 文件路径
            
        Returns:
            bool: 转换是否成功
        """
        logger.info(f"开始转换 PDF 文件: {input_path} -> {output_path}")
        
        if PdfToDocxConverter is None:
            logger.error("pdf2docx not available")
            return False
        
        try:
            # 使用 pdf2docx 进行转换
            cv = PdfToDocxConverter(input_path)
            cv.convert(output_path)
            cv.close()
            
            logger.info(f"PDF 转 Word 成功: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"PDF 转 Word 失败: {str(e)}")
            return False
    
    def pdf_to_ppt(self, input_path: str, output_path: str) -> bool:
        """
        将 PDF 转换为 PPT
        
        Args:
            input_path: 输入 PDF 文件路径
            output_path: 输出 PPT 文件路径
            
        Returns:
            bool: 转换是否成功
        """
        logger.info(f"开始转换 PDF 文件: {input_path} -> {output_path}")
        
        if PdfToDocxConverter is None or Presentation is None:
            logger.error("Required libraries for PDF to PPT conversion not available")
            return False
        
        try:
            # 首先将 PDF 转换为 Word，然后将 Word 内容导入 PPT
            temp_docx = input_path.replace('.pdf', '_temp.docx')
            
            # PDF to Word
            cv = PdfToDocxConverter(input_path)
            cv.convert(temp_docx)
            cv.close()
            
            # Word to PPT
            prs = Presentation()
            doc = words.Document(temp_docx)
            
            # 添加每一段文本到幻灯片
            slide = None
            for para in doc.paragraphs:
                if para.text.strip():
                    if slide is None:
                        slide = prs.slides.add_slide(prs.slide_layouts[1])  # 标题和内容布局
                        title = slide.shapes.title
                        title.text = "Converted Slide"
                        
                        content = slide.shapes.placeholders[1]
                        content.text = para.text
                    else:
                        slide = prs.slides.add_slide(prs.slide_layouts[1])
                        title = slide.shapes.title
                        title.text = f"Slide {len(prs.slides)}"
                        
                        content = slide.shapes.placeholders[1]
                        content.text = para.text
            
            prs.save(output_path)
            
            # 清理临时文件
            if os.path.exists(temp_docx):
                os.remove(temp_docx)
                
            logger.info(f"PDF 转 PPT 成功: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"PDF 转 PPT 失败: {str(e)}")
            return False
    
    def _fallback_ppt_to_pdf_with_unoconv(self, input_path: str, output_path: str) -> bool:
        """
        使用 unoconv 作为备选方案进行 PPT 到 PDF 的转换
        """
        logger.info(f"使用 unoconv 作为备选方案进行 PPT 转 PDF: {input_path} -> {output_path}")
        
        try:
            # 确保输出目录存在
            output_dir = os.path.dirname(output_path)
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
            
            # 使用 unoconv 进行转换
            cmd = ["unoconv", "-f", "pdf", "-o", output_path, input_path]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                logger.info(f"Fallback PPT to PDF successful: {output_path}")
                return True
            else:
                logger.error(f"Fallback PPT to PDF failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("Fallback PPT to PDF timed out")
            return False
        except Exception as e:
            logger.error(f"Fallback PPT to PDF error: {str(e)}")
            return False
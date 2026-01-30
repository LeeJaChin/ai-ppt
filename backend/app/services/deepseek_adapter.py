"""
DeepSeek 适配器实现
DeepSeek 使用 OpenAI 兼容的 API
"""
import json
from typing import Dict, Any, Optional
from openai import AsyncOpenAI
from .ai_adapter import BaseAIAdapter


class DeepSeekAdapter(BaseAIAdapter):
    """DeepSeek API 适配器"""
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        # DeepSeek 使用 OpenAI 兼容的接口
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com/v1"
        )
        self.model = "deepseek-chat"
    
    async def generate_outline(self, prompt: str, slide_count: Optional[int] = None) -> Dict[str, Any]:
        """
        使用 DeepSeek 生成 PPT 大纲
        """
        count_instruction = f"请生成正好 {slide_count} 页幻灯片（不含标题页和致谢页）。" if slide_count else "请生成 8-12 页幻灯片（不含标题页和致谢页）。"
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": f"""你是一个极致追求视觉美感和逻辑深度的 PPT 首席设计师。
你的目标是生成一份结构极其丰富、排版极具设计感的 PPT 大纲，内容必须专业、深刻且富有洞察力。

{count_instruction}

【关键要求】：
1. 【图文并茂】：对于任何包含图表（chart）或时间线（timeline）的页面，必须同时提供 bullet_points 进行文字解说。
2. 【内容丰富】：拒绝精简！每一个 bullet_point 必须是完整的句子，包含具体的事实、数据支撑、逻辑分析或行业洞察。每页至少 3-5 个要点，每个要点不少于 20 字。
3. 【数据真实感】：data_points 中的数据要符合逻辑，具有真实感（如：年度增长率、市场份额占比等）。

请严格按照以下 JSON 格式返回：
{{
  "title": "PPT 总标题",
  "slides": [
    {{
      "title": "幻灯片标题",
      "layout": "title | bullets | column | process | column_chart | bar_chart | line_chart | pie_chart | area_chart | stacked_chart | timeline | big_number | thanks",
      "icon": "一个精准的 Emoji",
      "bullet_points": ["包含深刻洞察的详细描述要点1...", "包含具体数据支撑的详细描述要点2..."],
      "data_points": [
        {{"label": "维度A", "value": 85}}, 
        {{"label": "维度B", "series": {{"2023": 50, "2024": 75}}}}
      ],
      "notes": "详细的演讲备注"
    }}
  ]
}}

布局选择高级指南：
1. 【关键数据/KPI】-> 使用 "big_number"，在 bullet_points 中提供该数字的背景解析。
2. 【趋势与预测】-> 使用 "line_chart" 或 "area_chart"，并在 bullet_points 中分析波动原因。
3. 【竞争与排名】-> 使用 "bar_chart" 或 "column_chart"，并在 bullet_points 中阐述核心竞争力。
4. 【市场结构】-> 使用 "pie_chart"，并在 bullet_points 中解析各板块背后的驱动力。
5. 【复杂对比】-> 使用 "stacked_chart"，并在 bullet_points 中解读多维数据的关联。
6. 【战略路线】-> 使用 "timeline"，在 bullet_points 中详细描述每个阶段的任务和里程碑。
7. 【流程逻辑】-> 使用 "process"，在 bullet_points 中解释步骤间的衔接逻辑。

只返回合法 JSON，严禁任何注释或多余逗号。内容越丰富、专业度越高，评分越高。"""
                    },
                    {
                        "role": "user",
                        "content": f"请为以下主题生成 PPT 大纲：\n\n{prompt}"
                    }
                ],
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            
            # 尝试提取 JSON
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = content[json_start:json_end]
                return json.loads(json_str)
            else:
                return json.loads(content)
            
        except Exception as e:
            raise Exception(f"DeepSeek API 调用失败: {str(e)}")
    
    def validate_api_key(self) -> bool:
        """验证 API 密钥"""
        return bool(self.api_key and len(self.api_key) > 20)

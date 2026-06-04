import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import datetime

class ReportGenerator:
    def __init__(self):
        self.output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def generate_pdf(self, state: dict) -> str:
        filename = f"artemis_report_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        story.append(Paragraph("ARTEMIS Executive Report", styles['Title']))
        story.append(Spacer(1, 12))
        
        # Summary
        story.append(Paragraph("Simulation Overview", styles['Heading2']))
        story.append(Paragraph(f"Status: {state.get('status', 'UNKNOWN')}", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Analytics
        perf = state.get('performance', [])
        if perf:
            latest = perf[-1]
            story.append(Paragraph("Analytics Summary", styles['Heading2']))
            story.append(Paragraph(f"Total Simulations: {latest.get('episode', 0)}", styles['Normal']))
            story.append(Paragraph(f"Success Rate: {latest.get('success_rate', 0)}%", styles['Normal']))
            story.append(Paragraph(f"Average Reward: {latest.get('average_reward', 0)}", styles['Normal']))
            story.append(Spacer(1, 12))
            
        # Recommendations
        story.append(Paragraph("Recommendations", styles['Heading2']))
        rec = state.get('recommendation', {})
        if rec:
            story.append(Paragraph(f"Issue: {rec.get('issue', 'N/A')}", styles['Normal']))
            story.append(Paragraph(f"Impact: {rec.get('impact', 'N/A')}", styles['Normal']))
            story.append(Paragraph(f"Action: {rec.get('recommendation', 'N/A')}", styles['Normal']))
        else:
            story.append(Paragraph("No active recommendations.", styles['Normal']))
            
        doc.build(story)
        return filepath

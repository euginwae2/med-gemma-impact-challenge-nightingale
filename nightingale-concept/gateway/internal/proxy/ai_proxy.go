package proxy

import "github.com/gin-gonic/gin"

type AIProxy struct {
	*Proxy
}

func NewAIProxy(aiServiceURL string) *AIProxy {
	return &AIProxy{
		Proxy: NewProxy(aiServiceURL),
	}
}

func (p *AIProxy) AnalyzeText(c *gin.Context) {
	p.ForwardRequest(c, "/api/v1/text/generate")
}

func (p *AIProxy) AnalyzeClinicalText(c *gin.Context) {
	p.ForwardRequest(c, "/api/v1/clinical/summary")
}

func (p *AIProxy) ExplainMedicalTerm(c *gin.Context) {
	term := c.PostForm("term")
	readingLevel := c.PostForm("reading_level")

	// Forward to AI service
	p.ForwardRequest(c, "/api/v1/explain/term?term="+term+"&reading_level="+readingLevel)
}

func (p *AIProxy) SummarizeClinicalNote(c *gin.Context) {
	p.ForwardRequest(c, "/api/v1/clinical/summary")
}

func (p *AIProxy) ProcessInsuranceDocument(c *gin.Context) {
	p.ForwardRequest(c, "/api/v1/insurance/document")
}

package proxy

import "github.com/gin-gonic/gin"

type BackendProxy struct {
	*Proxy
}

func NewBackendProxy(backendURL string) *BackendProxy {
	return &BackendProxy{
		Proxy: NewProxy(backendURL),
	}
}

func (p *BackendProxy) GetPatients(c *gin.Context) {
	p.ForwardRequest(c, "/patients")
}

func (p *BackendProxy) CreatePatient(c *gin.Context) {
	p.ForwardRequest(c, "/patients")
}

func (p *BackendProxy) GetPatientByID(c *gin.Context) {
	id := c.Param("id")
	p.ForwardRequest(c, "/patients/"+id)
}

func (p *BackendProxy) GetPatientRecords(c *gin.Context) {
	id := c.Param("id")
	p.ForwardRequest(c, "/patients/"+id+"/records")
}

func (p *BackendProxy) UpdatePatient(c *gin.Context) {
	id := c.Param("id")
	p.ForwardRequest(c, "/patients/"+id+"/records")
}

func (p *BackendProxy) CreateClinicalNote(c *gin.Context) {
	p.ForwardRequest(c, "/clinical/notes")
}

func (p *BackendProxy) GetClinicalNote(c *gin.Context) {
	id := c.Param("id")
	p.ForwardRequest(c, "/clinical/notes"+id)
}

func (p *BackendProxy) GetInsuranceCoverage(c *gin.Context) {
	p.ForwardRequest(c, "/insurance/coverage")
}

func (p *BackendProxy) EstimateCost(c *gin.Context) {
	p.ForwardRequest(c, "/insurance/estimate")
}

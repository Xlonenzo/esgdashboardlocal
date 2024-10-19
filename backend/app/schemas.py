from pydantic import BaseModel, constr, Field, EmailStr
from datetime import date
from typing import Optional, List

class KPIBase(BaseModel):
    name: str
    unit: str
    category: str
    subcategory: str
    description: str
    target_value: float
    actual_value: float
    frequency: str
    collection_method: str
    status: str
    year: int
    month: int  # Novo campo
    cnpj: str
    kpicode: str
    company_category: str  # Novo campo adicionado
    isfavorite: bool  # Novo campo adicionado
    compliance: Optional[List[str]] = []  # Novo campo

class KPICreate(KPIBase):
    pass

class KPI(KPIBase):
    id: int

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    description: str
    status: str
    impact: str
    probability: str

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    action_plan_id: int

    class Config:
        from_attributes = True

class ActionPlanBase(BaseModel):
    objective: str
    start_date: date
    end_date: date
    kpi_id: Optional[int] = None  # Adicionado este campo

class ActionPlanCreate(ActionPlanBase):
    pass

class ActionPlan(ActionPlanBase):
    id: int
    tasks: List[Task] = []
    kpi: Optional[KPI] = None

    class Config:
        from_attributes = True

class CompanyBase(BaseModel):
    cnpj: str
    name: str
    razao_social: Optional[str] = None
    endereco: Optional[str] = None
    trade_name: Optional[str] = None
    registration_date: Optional[date] = None
    size: Optional[str] = None
    sector: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = True

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int

    class Config:
        from_attributes = True

class KPITemplateBase(BaseModel):
    name: str
    unit: str
    category: str
    subcategory: str
    description: str
    frequency: str
    collection_method: str
    kpicode: Optional[str] = Field(default=None)
    company_category: str
    compliance: List[str]  # Defina como uma lista de strings
    genero: Optional[str] = None  # Novo campo
    raca: Optional[str] = None  # Novo campo

class KPITemplateCreate(KPITemplateBase):
    pass

class KPITemplate(KPITemplateBase):
    id: int

    class Config:
        from_attributes = True

class KPIEntryBase(BaseModel):
    template_id: int
    cnpj: str
    actual_value: float
    target_value: float
    year: int
    month: int
    status: str
    isfavorite: bool = False

class KPIEntryCreate(KPIEntryBase):
    pass

class KPIEntry(KPIEntryBase):
    id: int

    class Config:
        from_attributes = True

class KPIEntryWithTemplate(BaseModel):
    entry_id: int
    template_id: int
    template_name: str
    cnpj: str
    actual_value: float
    target_value: float
    year: int
    month: int
    status: str
    isfavorite: bool
    unit: str
    category: str
    subcategory: str
    description: str
    frequency: str
    collection_method: str
    kpicode: str
    company_category: str
    compliance: Optional[List[str]] = []
    genero: Optional[str] = None  # Novo campo
    raca: Optional[str] = None  # Novo campo
    state: Optional[str] = None  # Torna o campo opcional

    class Config:
        from_attributes = True

class CustomizationBase(BaseModel):
    sidebar_color: str
    button_color: str
    font_color: str
    logo_url: str

class CustomizationCreate(CustomizationBase):
    pass

class Customization(CustomizationBase):
    id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

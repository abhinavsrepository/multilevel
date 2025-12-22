import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Steps,
  App, // Import App
  Row,
  Col,
  Upload,
  Divider,
  Space,
} from 'antd';
import {
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyApi, Property } from '@/api/property.api';

const { Option } = Select;
const { TextArea } = Input;

const AddEditProperty: React.FC = () => {
  const { message } = App.useApp(); // Use App hook
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<any[]>([]);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await propertyApi.getById(id!);
      if (response.data && response.data.data) {
        const propertyData = response.data.data;
        form.setFieldsValue(propertyData);
        if (propertyData.images) {
          setFileList(
            propertyData.images.map((url, index) => ({
              uid: `-${index}`,
              name: `image-${index}`,
              status: 'done',
              url,
            }))
          );
        }
      }
    } catch (error) {
      message.error('Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // Validate all required fields before submission
      const requiredFields = [
        'propertyId',
        'title',
        'propertyType',
        'propertyCategory',
        'address',
        'city',
        'state',
        'basePrice',
        'totalInvestmentSlots',
      ];

      const missingFields = requiredFields.filter((field) => !values[field]);

      if (missingFields.length > 0) {
        message.error(`Missing required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      const formData = {
        ...values,
        images: fileList.map((file) => file.url || file.response?.data?.url).filter(Boolean),
      };

      if (isEditMode) {
        await propertyApi.update(id!, formData);
        message.success('Property updated successfully');
      } else {
        await propertyApi.create(formData);
        message.success('Property created successfully');
      }
      navigate('/properties');
    } catch (error: any) {
      // Show specific error message from backend
      // Note: axiosConfig.ts doesn't show toast anymore, so we must do it here.
      // Backend now returns specific messages for validation/duplicates.
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to save property';

      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Show validation lines
        message.error(`${errorMsg}: ${error.response.data.errors.join(', ')}`);
      } else {
        message.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      const response = await propertyApi.uploadImage(file);
      onSuccess(response.data, file);
      message.success(`${file.name} uploaded successfully`);
    } catch (error) {
      onError(error);
      message.error(`${file.name} upload failed`);
    }
  };

  const steps = [
    {
      title: 'Basic Info',
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Property Title"
                rules={[{ required: true, message: 'Please enter property title' }]}
              >
                <Input placeholder="e.g. Luxury Apartment in Downtown" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="propertyId"
                label="Property ID"
                rules={[{ required: true, message: 'Please enter property ID' }]}
              >
                <Input placeholder="e.g. PROP-001" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="propertyType"
                label="Property Type"
                rules={[{ required: true, message: 'Please select property type' }]}
              >
                <Select placeholder="Select Type">
                  <Option value="RESIDENTIAL">Residential</Option>
                  <Option value="COMMERCIAL">Commercial</Option>
                  <Option value="LAND">Land</Option>
                  <Option value="INDUSTRIAL">Industrial</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="propertyCategory"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select Category">
                  <Option value="PREMIUM">Premium</Option>
                  <Option value="LUXURY">Luxury</Option>
                  <Option value="AFFORDABLE">Affordable</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Detailed description of the property" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="AVAILABLE">Available</Option>
                  <Option value="BOOKING_OPEN">Booking Open</Option>
                  <Option value="UPCOMING">Upcoming</Option>
                  <Option value="SOLD_OUT">Sold Out</Option>
                  <Option value="INACTIVE">Inactive (Hidden)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                <Select>
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isNewLaunch" label="New Launch" valuePropName="checked">
                <Select>
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      title: 'Location',
      content: (
        <>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please enter state' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="pincode"
                label="Pincode"
                rules={[{ required: true, message: 'Please enter pincode' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitude">
                <InputNumber style={{ width: '100%' }} step="0.000001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="Longitude">
                <InputNumber style={{ width: '100%' }} step="0.000001" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="googleMapsLink" label="Google Maps Link">
            <Input />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Specifications',
      content: (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="totalArea" label="Total Area (sq ft)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="builtUpArea" label="Built-up Area (sq ft)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="floors" label="Total Floors">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="bedrooms" label="Bedrooms">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bathrooms" label="Bathrooms">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="facing" label="Facing">
                <Select>
                  <Option value="North">North</Option>
                  <Option value="South">South</Option>
                  <Option value="East">East</Option>
                  <Option value="West">West</Option>
                  <Option value="North-East">North-East</Option>
                  <Option value="North-West">North-West</Option>
                  <Option value="South-East">South-East</Option>
                  <Option value="South-West">South-West</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="amenities" label="Amenities">
            <Select mode="tags" placeholder="Type and press enter to add amenities" />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Financials',
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="basePrice"
                label="Base Price"
                rules={[{ required: true, message: 'Please enter base price' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/₹\s?|(,*)/g, '')}
                  placeholder="Enter base price"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="investmentPrice" label="Investment Price">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/₹\s?|(,*)/g, '')}
                  placeholder="Enter investment price"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="totalInvestmentSlots"
                label="Total Slots"
                rules={[{ required: true, message: 'Please enter total slots' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="123" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minimumInvestment" label="Min Investment">
                <InputNumber style={{ width: '100%' }} placeholder="123" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="expectedRoiPercent" label="Expected ROI (%)">
                <InputNumber style={{ width: '100%' }} placeholder="123" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roiTenureMonths" label="ROI Tenure (Months)">
                <InputNumber style={{ width: '100%' }} placeholder="12" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="appreciationRateAnnual" label="Annual Appreciation (%)">
                <InputNumber style={{ width: '100%' }} placeholder="123" />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      title: 'Media',
      content: (
        <>
          <Form.Item label="Property Images">
            <Upload
              listType="picture-card"
              fileList={fileList}
              customRequest={handleUpload}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              {fileList.length >= 8 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="virtualTourUrl" label="Virtual Tour URL">
            <Input prefix={<UploadOutlined />} />
          </Form.Item>
          <Form.Item name="videos" label="Video Links">
            <Select mode="tags" placeholder="Add video URLs" />
          </Form.Item>
        </>
      ),
    },
  ];

  const next = () => {
    // Get the field names for the current step
    const currentStepFields = getCurrentStepFields(currentStep);

    form
      .validateFields(currentStepFields)
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch((error) => {
        message.error('Please complete the required fields in this step');
      });
  };

  // Helper function to get field names for each step
  const getCurrentStepFields = (step: number): string[] => {
    switch (step) {
      case 0: // Basic Info
        return ['title', 'propertyId', 'propertyType', 'propertyCategory', 'description'];
      case 1: // Location
        return ['address', 'city', 'state', 'pincode'];
      case 2: // Specifications
        return []; // No required fields in this step
      case 3: // Financials
        return ['basePrice', 'totalInvestmentSlots'];
      case 4: // Media
        return []; // No required fields in this step
      default:
        return [];
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="add-edit-property">
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{isEditMode ? 'Edit Property' : 'Add New Property'}</span>
            <Button onClick={() => navigate('/properties')}>Cancel</Button>
          </div>
        }
      >
        <Steps
          current={currentStep}
          style={{ marginBottom: 24 }}
          items={steps.map((item) => ({ title: item.title }))}
        />

        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'AVAILABLE' }}>
          <div className="steps-content">
            {steps.map((step, index) => (
              <div key={index} style={{ display: index === currentStep ? 'block' : 'none' }}>
                {step.content}
              </div>
            ))}
          </div>

          <div className="steps-action" style={{ marginTop: 24, textAlign: 'right' }}>
            {currentStep > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={() => prev()} icon={<ArrowLeftOutlined />}>
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={() => next()} icon={<ArrowRightOutlined />}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                {isEditMode ? 'Update Property' : 'Create Property'}
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditProperty;

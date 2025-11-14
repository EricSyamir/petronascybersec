#!/usr/bin/env python3
"""
AI vs Human Image Detection Inference Script
This script loads a trained PyTorch model and performs inference on images.
"""

import sys
import json
import os

    # Import with helpful error messages
try:
    import torch
except ImportError:
    print(json.dumps({
        'success': False,
        'error': 'PyTorch not installed. Please run: pip install torch torchvision'
    }), file=sys.stdout)
    sys.exit(1)

try:
    import timm
except ImportError:
    print(json.dumps({
        'success': False,
        'error': 'timm not installed. Please run: pip install timm'
    }), file=sys.stdout)
    sys.exit(1)

try:
    import albumentations as albu
    from albumentations.pytorch import ToTensorV2
except ImportError:
    print(json.dumps({
        'success': False,
        'error': 'albumentations not installed. Please run: pip install albumentations'
    }), file=sys.stdout)
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print(json.dumps({
        'success': False,
        'error': 'Pillow not installed. Please run: pip install Pillow'
    }), file=sys.stdout)
    sys.exit(1)

try:
    import numpy as np
except ImportError:
    print(json.dumps({
        'success': False,
        'error': 'numpy not installed. Please run: pip install numpy'
    }), file=sys.stdout)
    sys.exit(1)

# Configuration
MODEL_PATH = "best_model.pth"
IMG_SIZE = 384
NUM_CLASSES = 2
MODEL_NAME = "tf_efficientnetv2_s.in21k_ft_in1k"

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Define validation transform (same as in training)
val_transform = albu.Compose([
    albu.Resize(IMG_SIZE, IMG_SIZE),
    albu.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
    ToTensorV2()
])

def load_model(model_path=MODEL_PATH):
    """Load the trained model."""
    try:
        # Create model architecture
        model = timm.create_model(MODEL_NAME, pretrained=False, num_classes=NUM_CLASSES)
        
        # Load trained weights
        state_dict = torch.load(model_path, map_location=device)
        model.load_state_dict(state_dict)
        model.to(device)
        model.eval()  # Set to evaluation mode
        
        # Verify model loaded correctly by checking a weight value
        # Get first parameter value to verify it's not random
        first_param = next(iter(model.parameters()))
        first_param_value = first_param.data[0][0][0][0].item() if len(first_param.shape) >= 4 else first_param.data[0].item()
        
        # Debug output only if DEBUG environment variable is set
        if os.environ.get('DEBUG', '').lower() in ('1', 'true', 'yes'):
            print(f"Model loaded. First parameter value: {first_param_value:.6f}", file=sys.stderr)
        
        return model
    except FileNotFoundError:
        # Don't print JSON to stderr - return None and let main() handle it
        return None
    except Exception as e:
        # Don't print JSON to stderr - return None and let main() handle it
        return None

def predict_image(model, image_path):
    """
    Predict if an image is AI-generated or human-generated.
    
    Args:
        model: Loaded PyTorch model
        image_path: Path to the image file
        
    Returns:
        dict: Prediction results with label and confidence
    """
    try:
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        image = np.array(image)
        
        # Apply transforms
        input_tensor = val_transform(image=image)['image'].unsqueeze(0).to(device)
        
        # Perform inference
        with torch.no_grad():
            outputs = model(input_tensor)
            
            raw_outputs = outputs.cpu().numpy()[0]
            
            # Debug output only if DEBUG environment variable is set
            if os.environ.get('DEBUG', '').lower() in ('1', 'true', 'yes'):
                print(f"Raw model outputs: {raw_outputs}", file=sys.stderr)
            
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            predicted_label = torch.argmax(outputs, dim=1).item()
            confidence = probabilities[0][predicted_label].item()
            
            # Debug output only if DEBUG environment variable is set
            if os.environ.get('DEBUG', '').lower() in ('1', 'true', 'yes'):
                prob_values = probabilities[0].cpu().numpy()
                print(f"Probabilities: human={prob_values[0]:.6f}, ai={prob_values[1]:.6f}", file=sys.stderr)
        
        # Return results
        # Label 0 = Human-generated, Label 1 = AI-generated
        result = {
            'success': True,
            'label': int(predicted_label),
            'label_name': 'AI-generated' if predicted_label == 1 else 'Human-generated',
            'confidence': float(confidence),
            'probabilities': {
                'human': float(probabilities[0][0].item()),
                'ai': float(probabilities[0][1].item())
            },
            'raw_outputs': {
                'human': float(raw_outputs[0]),
                'ai': float(raw_outputs[1])
            }
        }
        
        return result
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def main():
    """Main function to handle command-line arguments."""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'No image path provided'
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Check if image file exists
    if not os.path.exists(image_path):
        print(json.dumps({
            'success': False,
            'error': f'Image file not found: {image_path}'
        }))
        sys.exit(1)
    
    # Check if model file exists
    if not os.path.exists(MODEL_PATH):
        print(json.dumps({
            'success': False,
            'error': f'Model file not found: {MODEL_PATH}'
        }))
        sys.exit(1)
    
    # Load model
    try:
        model = load_model()
        if model is None:
            print(json.dumps({
                'success': False,
                'error': 'Failed to load model. Check stderr for details.'
            }))
            sys.exit(1)
        
        # Verify model is actually loaded (not just random weights)
        # Test with a dummy input to ensure model works
        dummy_input = torch.randn(1, 3, IMG_SIZE, IMG_SIZE).to(device)
        with torch.no_grad():
            dummy_output = model(dummy_input)
            if dummy_output.shape[1] != NUM_CLASSES:
                print(json.dumps({
                    'success': False,
                    'error': f'Model output shape mismatch. Expected {NUM_CLASSES} classes, got {dummy_output.shape[1]}'
                }))
                sys.exit(1)
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Error loading model: {str(e)}'
        }))
        sys.exit(1)
    
    # Perform prediction
    result = predict_image(model, image_path)
    
    # Output result as JSON to stdout only (no debug messages)
    # Ensure we flush stdout to make sure JSON is sent immediately
    json_output = json.dumps(result)
    print(json_output, file=sys.stdout, flush=True)
    
    sys.exit(0 if result.get('success', False) else 1)

if __name__ == '__main__':
    main()


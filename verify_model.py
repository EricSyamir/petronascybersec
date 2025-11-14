#!/usr/bin/env python3
"""
Verification script to check if the model is loading correctly.
This will help diagnose if the model weights are actually being used.
"""

import torch
import timm
import sys

MODEL_PATH = "best_model.pth"
MODEL_NAME = "tf_efficientnetv2_s.in21k_ft_in1k"
NUM_CLASSES = 2
IMG_SIZE = 384

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

print("=" * 60)
print("Model Verification Script")
print("=" * 60)

# Step 1: Create model without loading weights
print("\n1. Creating model architecture...")
model_random = timm.create_model(MODEL_NAME, pretrained=False, num_classes=NUM_CLASSES)
model_random.eval()

# Get a sample weight from random model
first_param_random = next(iter(model_random.parameters()))
first_param_value_random = first_param_random.data[0][0][0][0].item() if len(first_param_random.shape) >= 4 else first_param_random.data[0].item()
print(f"   Random model first parameter: {first_param_value_random:.6f}")

# Step 2: Load the saved model
print("\n2. Loading saved model weights...")
try:
    model_loaded = timm.create_model(MODEL_NAME, pretrained=False, num_classes=NUM_CLASSES)
    state_dict = torch.load(MODEL_PATH, map_location=device)
    
    print(f"   Model file size: {torch.load(MODEL_PATH, map_location='cpu').__sizeof__() / 1024 / 1024:.2f} MB (approximate)")
    print(f"   Number of parameters in state_dict: {len(state_dict)}")
    
    # Load weights
    model_loaded.load_state_dict(state_dict)
    model_loaded.to(device)
    model_loaded.eval()
    
    # Get the same weight from loaded model
    first_param_loaded = next(iter(model_loaded.parameters()))
    first_param_value_loaded = first_param_loaded.data[0][0][0][0].item() if len(first_param_loaded.shape) >= 4 else first_param_loaded.data[0].item()
    print(f"   Loaded model first parameter: {first_param_value_loaded:.6f}")
    
    # Compare
    if abs(first_param_value_random - first_param_value_loaded) < 0.0001:
        print("   ⚠️  WARNING: Parameters are very similar! Model might not have loaded correctly.")
    else:
        print("   ✓ Parameters differ - model weights appear to be loaded correctly.")
    
except Exception as e:
    print(f"   ✗ Error loading model: {e}")
    sys.exit(1)

# Step 3: Test inference with dummy input
print("\n3. Testing inference with dummy input...")
try:
    dummy_input = torch.randn(1, 3, IMG_SIZE, IMG_SIZE).to(device)
    
    with torch.no_grad():
        output_random = model_random(dummy_input)
        output_loaded = model_loaded(dummy_input)
    
    print(f"   Random model output: {output_random.cpu().numpy()[0]}")
    print(f"   Loaded model output: {output_loaded.cpu().numpy()[0]}")
    
    # Check if outputs are different
    diff = torch.abs(output_random - output_loaded).mean().item()
    print(f"   Average output difference: {diff:.6f}")
    
    if diff < 0.01:
        print("   ⚠️  WARNING: Outputs are very similar! Model might not be using trained weights.")
    else:
        print("   ✓ Outputs differ significantly - model appears to be using trained weights.")
        
except Exception as e:
    print(f"   ✗ Error during inference test: {e}")
    sys.exit(1)

# Step 4: Check model file
print("\n4. Checking model file...")
import os
if os.path.exists(MODEL_PATH):
    file_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)  # MB
    print(f"   Model file exists: {MODEL_PATH}")
    print(f"   File size: {file_size:.2f} MB")
    
    if file_size < 1:
        print("   ⚠️  WARNING: Model file is very small. Might be corrupted or empty.")
    elif file_size > 1000:
        print("   ⚠️  WARNING: Model file is very large. Might be wrong format.")
    else:
        print("   ✓ File size looks reasonable.")
else:
    print(f"   ✗ Model file not found: {MODEL_PATH}")

# Step 5: Test with actual image if provided
if len(sys.argv) > 1:
    image_path = sys.argv[1]
    print(f"\n5. Testing with actual image: {image_path}")
    try:
        from PIL import Image
        import numpy as np
        import albumentations as albu
        from albumentations.pytorch import ToTensorV2
        
        val_transform = albu.Compose([
            albu.Resize(IMG_SIZE, IMG_SIZE),
            albu.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2()
        ])
        
        image = Image.open(image_path).convert('RGB')
        image = np.array(image)
        input_tensor = val_transform(image=image)['image'].unsqueeze(0).to(device)
        
        with torch.no_grad():
            output = model_loaded(input_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            predicted_label = torch.argmax(output, dim=1).item()
            confidence = probabilities[0][predicted_label].item()
        
        print(f"   Raw outputs: {output.cpu().numpy()[0]}")
        print(f"   Probabilities: human={probabilities[0][0].item():.6f}, ai={probabilities[0][1].item():.6f}")
        print(f"   Predicted: {'AI-generated' if predicted_label == 1 else 'Human-generated'}")
        print(f"   Confidence: {confidence:.6f}")
        
        if confidence > 0.99:
            print("   ⚠️  WARNING: Extremely high confidence. This might indicate:")
            print("      - Model is overconfident")
            print("      - Image is very clear example")
            print("      - Model might not be working correctly")
        elif confidence < 0.5:
            print("   ⚠️  WARNING: Very low confidence. Model is uncertain.")
        else:
            print("   ✓ Confidence level looks reasonable.")
            
    except Exception as e:
        print(f"   ✗ Error testing with image: {e}")

print("\n" + "=" * 60)
print("Verification complete!")
print("=" * 60)


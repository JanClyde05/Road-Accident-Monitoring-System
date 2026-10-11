import os
from PIL import Image, ImageDraw

def create_circular_icon(src_path, size):
    img = Image.open(src_path).convert("RGBA")
    
    # Crop to square center
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    img = img.crop((left, top, left + min_dim, top + min_dim))
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Create circular mask
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size - 1, size - 1), fill=255)
    
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0), mask=mask)
    return output

def create_adaptive_foreground(src_path, canvas_size=432, logo_size=280):
    # Android Adaptive icon foreground (432x432, safe zone 264x264 centered)
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    img = img.crop((left, top, left + min_dim, top + min_dim))
    img = img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Circular mask
    mask = Image.new('L', (logo_size, logo_size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, logo_size - 1, logo_size - 1), fill=255)
    
    circular_logo = Image.new('RGBA', (logo_size, logo_size), (0, 0, 0, 0))
    circular_logo.paste(img, (0, 0), mask=mask)
    
    # Center on 432x432 transparent canvas
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    offset = (canvas_size - logo_size) // 2
    canvas.paste(circular_logo, (offset, offset), mask=circular_logo)
    return canvas

def main():
    src_logo = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Pictures", "LOGO", "LOGO.jpg"))
    if not os.path.exists(src_logo):
        src_logo = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "dist", "logo.jpg"))
    
    print(f"[INFO] Source Logo: {src_logo}")
    res_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "app", "src", "main", "res"))
    
    # Mipmap densities
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }
    
    for folder, size in densities.items():
        out_dir = os.path.join(res_dir, folder)
        os.makedirs(out_dir, exist_ok=True)
        
        # Standard icon
        icon = create_circular_icon(src_logo, size)
        icon.save(os.path.join(out_dir, "ic_launcher.png"), "PNG")
        icon.save(os.path.join(out_dir, "ic_launcher_round.png"), "PNG")
        
        # Remove legacy webp if present so PNG takes precedence
        webp_1 = os.path.join(out_dir, "ic_launcher.webp")
        webp_2 = os.path.join(out_dir, "ic_launcher_round.webp")
        if os.path.exists(webp_1): os.remove(webp_1)
        if os.path.exists(webp_2): os.remove(webp_2)
        
        print(f"[OK] Generated {folder} ({size}x{size})")
        
    # Adaptive foreground
    drawable_dir = os.path.join(res_dir, "drawable")
    os.makedirs(drawable_dir, exist_ok=True)
    fg = create_adaptive_foreground(src_logo, canvas_size=432, logo_size=280)
    fg.save(os.path.join(drawable_dir, "ic_launcher_foreground.png"), "PNG")
    print(f"[OK] Generated drawable/ic_launcher_foreground.png (432x432)")
    
    # Copy circular logo to drawable/logo.png for UI usage
    ui_logo = create_circular_icon(src_logo, 256)
    ui_logo.save(os.path.join(drawable_dir, "logo.png"), "PNG")
    print(f"[OK] Generated drawable/logo.png (256x256)")

if __name__ == "__main__":
    main()

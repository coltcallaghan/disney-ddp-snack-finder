# Cloudflare Setup for GitHub Pages

## Current Issue
Your Cloudflare DNS has A records pointing to GitHub Pages IP addresses, but the proper way to point a custom domain to GitHub Pages is with a CNAME record.

## Step-by-Step Fix

### Option 1: Using CNAME Flattening (Recommended for Cloudflare)

1. **Log into Cloudflare** → Select your domain
2. **Go to DNS Records**
3. **Remove the A records** for `dohertyholiday.co.uk`:
   - Delete: 185.199.111.153
   - Delete: 185.199.110.153
   - Delete: 185.199.109.153
   - Delete: 185.199.108.153

4. **Add a CNAME record**:
   - **Type**: CNAME
   - **Name**: `@` or `dohertyholiday.co.uk` (apex/root domain)
   - **Content**: `coltcallaghan.github.io`
   - **Proxy status**: DNS only (orange) or Proxied (orange cloud)
   - **TTL**: Auto

5. **Keep your existing CNAME for www**:
   - Type: CNAME
   - Name: `www`
   - Content: `coltcallaghan.github.io`
   - Already configured ✅

### Option 2: If Cloudflare Won't Allow CNAME at Apex

Cloudflare has a feature called **CNAME Flattening** that allows this. If you can't add a CNAME record at the root:

1. **Use Alias Record** (Cloudflare feature):
   - Type: CNAME
   - Name: `@`
   - Content: `coltcallaghan.github.io`
   - Cloudflare automatically flattens this to A records

2. **Or use Page Rules** to redirect:
   - Forward: `dohertyholiday.co.uk` → `www.dohertyholiday.co.uk` (301 redirect)
   - This way your www CNAME works and root redirects to it

## GitHub Pages Configuration

### 1. Add Custom Domain to GitHub Pages

1. **Go to your GitHub repository**:
   - https://github.com/coltcallaghan/disney-ddp-snack-finder

2. **Click Settings** → **Pages** (in left sidebar)

3. **Under "Custom domain"**:
   - Enter: `dohertyholiday.co.uk`
   - Click **Save**

4. **GitHub will create CNAME file** in `gh-pages` branch automatically

5. **Enable "Enforce HTTPS"** (recommended):
   - Check the box
   - Wait a few minutes for SSL certificate to be generated

### 2. Configure GitHub Pages Source

1. **Still in Settings → Pages**
2. **Build and deployment → Source**: Select **Deploy from a branch**
3. **Branch**: Select `gh-pages` and `/root`
4. **Save**

## DNS Propagation

After making changes:
1. **DNS propagation takes 15 minutes to 48 hours** (usually faster)
2. Check status: https://dnschecker.org/
3. Look up `dohertyholiday.co.uk` A record and CNAME record

## Verify Setup

### Check Cloudflare DNS
```bash
# Should show CNAME record
nslookup -type=CNAME dohertyholiday.co.uk

# Should show GitHub Pages IP (or resolve through CNAME)
nslookup dohertyholiday.co.uk
```

### Check GitHub Pages
1. Go to: https://github.com/coltcallaghan/disney-ddp-snack-finder/settings/pages
2. Verify:
   - ✅ Custom domain: `dohertyholiday.co.uk`
   - ✅ HTTPS enabled
   - ✅ Source: gh-pages branch

### Test in Browser
1. Visit: `https://dohertyholiday.co.uk`
2. Should load the app
3. Assets should load without 404 errors
4. Check browser DevTools → Network tab for any 404s

## Troubleshooting

### Still getting 404s on assets?
1. **Clear browser cache**: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. **Clear Cloudflare cache**:
   - Cloudflare Dashboard → Caching → Purge Cache → Purge All
3. **Wait for DNS propagation**: Can take up to 48 hours
4. **Check GitHub Pages**:
   - Visit: https://coltcallaghan.github.io/
   - Should load the app (this is the source)

### Custom domain not working?
1. Check Cloudflare DNS records are correct
2. Check GitHub Pages settings show custom domain
3. Check if SSL certificate is issued (HTTPS)
4. Look for DNS/CNAME verification issues in GitHub Pages settings

## Final DNS Configuration

After completion, you should have:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| CNAME | @ | coltcallaghan.github.io | DNS only or Proxied |
| CNAME | www | coltcallaghan.github.io | DNS only or Proxied |

(Or A records if using Cloudflare's Alias/flattening feature)

## References
- [Cloudflare + GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-pages-site)
- [GitHub Pages Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-pages-site/managing-a-custom-domain-for-your-github-pages-site)
